import { describeWeather } from "./weatherCodes.js";

const weatherEl = document.getElementById("weather");
const suggestionsEl = document.getElementById("suggestions");
const recentEl = document.getElementById("recent");

// Escape text before putting it into innerHTML (prevents XSS from API data).
function esc(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

export function showLoading() {
  weatherEl.innerHTML = `<div class="skeleton" aria-label="Loading weather"></div>`;
}

export function showMessage(text, isError = false) {
  weatherEl.innerHTML = `<p class="message ${isError ? "error" : ""}">${esc(text)}</p>`;
}

export function renderWeather(place, data, unit) {
  const symbol = unit === "celsius" ? "°C" : "°F";
  const { current, daily } = data;
  const { label, icon } = describeWeather(current.weather_code);
  const region = [place.admin1, place.country].filter(Boolean).join(", ");

  const days = daily.time
    .map((date, i) => {
      const d = describeWeather(daily.weather_code[i]);
      const name =
        i === 0 ? "Today" : new Date(date + "T00:00").toLocaleDateString("en-IN", { weekday: "short" });
      return `
        <article class="day">
          <div class="name">${esc(name)}</div>
          <div class="icon" aria-hidden="true">${d.icon}</div>
          <div class="range"><b>${Math.round(daily.temperature_2m_max[i])}°</b> / ${Math.round(daily.temperature_2m_min[i])}°</div>
          <div class="range">${esc(d.label)}</div>
        </article>`;
    })
    .join("");

  weatherEl.innerHTML = `
    <section class="current">
      <div>
        <p class="place">${esc(place.name)} <small>${esc(region)}</small></p>
        <p class="temp">${Math.round(current.temperature_2m)}${symbol}</p>
        <p class="condition">${esc(label)}</p>
      </div>
      <div class="icon-big" aria-hidden="true">${icon}</div>
    </section>

    <div class="stats">
      <div class="stat"><span>Feels like</span><strong>${Math.round(current.apparent_temperature)}${symbol}</strong></div>
      <div class="stat"><span>Humidity</span><strong>${current.relative_humidity_2m}%</strong></div>
      <div class="stat"><span>Wind</span><strong>${Math.round(current.wind_speed_10m)} km/h</strong></div>
    </div>

    <h2 class="forecast-title">5-day forecast</h2>
    <div class="forecast">${days}</div>`;
}

export function renderSuggestions(cities) {
  if (!cities.length) {
    suggestionsEl.hidden = true;
    suggestionsEl.innerHTML = "";
    return;
  }
  suggestionsEl.innerHTML = cities
    .map(
      (c, i) => `
      <li role="option" data-index="${i}">
        ${esc(c.name)} <small>${esc([c.admin1, c.country].filter(Boolean).join(", "))}</small>
      </li>`
    )
    .join("");
  suggestionsEl.hidden = false;
}

export function hideSuggestions() {
  suggestionsEl.hidden = true;
}

export function renderRecent(places) {
  recentEl.innerHTML = places
    .map((p, i) => `<button type="button" class="chip" data-index="${i}">${esc(p.name)}</button>`)
    .join("");
}
