// Small wrapper around localStorage with safe fallbacks.
const KEY = "skynow:recent";

export function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveRecent(place) {
  const list = [place, ...loadRecent().filter((p) => p.id !== place.id)].slice(0, 5);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable - ignore */
  }
  return list;
}
