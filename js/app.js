import { searchCities, getWeather } from "./api.js";
import { loadRecent, saveRecent } from "./storage.js";
import {
  showLoading, showMessage, renderWeather,
  renderSuggestions, hideSuggestions, renderRecent,
} from "./ui.js";

const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const suggestionsEl = document.getElementById("suggestions");
const recentEl = document.getElementById("recent");
const locateBtn = document.getElementById("locate-btn");
const unitButtons = document.querySelectorAll(".unit");

const state = {
  unit: "celsius",
  place: null,        // the city currently shown
  suggestions: [],    // results from the geocoding API
  recent: loadRecent(),
};

/* ---------- helpers ---------- */
function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

async function loadPlace(place) {
  state.place = place;
  hideSuggestions();
  showLoading();
  try {
    const data = await getWeather(place, state.unit);
    renderWeather(place, data, state.unit);
  } catch (err) {
    showMessage(err.message, true);
  }
}

function rememberPlace(place) {
  if (!place.id) return; // "My location" has no id
  state.recent = saveRecent(place);
  renderRecent(state.recent);
}

/* ---------- search ---------- */
const onType = debounce(async () => {
  const query = input.value.trim();
  if (query.length < 2) return renderSuggestions([]);
  try {
    state.suggestions = await searchCities(query);
    renderSuggestions(state.suggestions);
  } catch {
    renderSuggestions([]);
  }
});
input.addEventListener("input", onType);

suggestionsEl.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const place = state.suggestions[Number(li.dataset.index)];
  input.value = place.name;
  rememberPlace(place);
  loadPlace(place);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return showMessage("Type a city name to search.", true);
  showLoading();
  try {
    const results = await searchCities(query);
    if (!results.length) return showMessage(`No city found for "${query}". Check the spelling.`, true);
    rememberPlace(results[0]);
    loadPlace(results[0]);
  } catch (err) {
    showMessage(err.message, true);
  }
});

/* ---------- recent searches ---------- */
recentEl.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  loadPlace(state.recent[Number(chip.dataset.index)]);
});

/* ---------- unit toggle ---------- */
unitButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.unit = btn.dataset.unit;
    unitButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    if (state.place) loadPlace(state.place);
  });
});

/* ---------- geolocation ---------- */
locateBtn.addEventListener("click", () => {
  if (!("geolocation" in navigator)) return showMessage("Your browser does not support location.", true);
  showLoading();
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => loadPlace({ name: "Your location", latitude: coords.latitude, longitude: coords.longitude }),
    () => showMessage("Location permission was denied. Search for a city instead.", true)
  );
});

/* ---------- close suggestions when clicking outside ---------- */
document.addEventListener("click", (e) => {
  if (!form.contains(e.target)) hideSuggestions();
});

/* ---------- start ---------- */
renderRecent(state.recent);
if (state.recent.length) loadPlace(state.recent[0]);
