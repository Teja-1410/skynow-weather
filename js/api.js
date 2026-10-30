// All network calls live here so the UI code stays simple.
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

export async function searchCities(query) {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("City search failed. Please try again.");
  const data = await res.json();
  return data.results ?? [];
}

export async function getWeather({ latitude, longitude }, unit = "celsius") {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    temperature_unit: unit,
    wind_speed_unit: "kmh",
    timezone: "auto",
    forecast_days: "5",
  });
  const res = await fetch(`${WEATHER_URL}?${params}`);
  if (!res.ok) throw new Error("Could not load weather data. Please try again.");
  return res.json();
}
