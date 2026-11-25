/**
 * Local weather for the edition's ear, from Open-Meteo (free, no key, CORS-enabled).
 * The reader's rounded coordinates are kept in this browser and only ever sent to Open-Meteo.
 */
export interface Weather {
  temp: number;
  high: number;
  low: number;
  code: number;
  isDay: boolean;
  unit: "F" | "C";
  fetchedAt: number;
}

export interface Place {
  lat: number;
  lon: number;
}

const PLACE_KEY = "extra-extra:weather-place";
const CACHE_KEY = "extra-extra:weather";
const CACHE_MS = 30 * 60 * 1000;

export type Sky = "sun" | "moon" | "partly" | "cloud" | "fog" | "rain" | "snow" | "storm";

/** WMO weather codes, grouped into what a newspaper weather box would say. */
export function describeWeather(code: number, isDay = true): { label: string; sky: Sky } {
  if (code === 0) return isDay ? { label: "Sunny", sky: "sun" } : { label: "Clear", sky: "moon" };
  if (code <= 2) return { label: "Partly cloudy", sky: "partly" };
  if (code === 3) return { label: "Overcast", sky: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog", sky: "fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", sky: "rain" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: "Rain", sky: "rain" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { label: "Snow", sky: "snow" };
  if (code >= 95) return { label: "Thunderstorms", sky: "storm" };
  return { label: "Mixed", sky: "cloud" };
}

/** Fahrenheit for the US and a few others; Celsius everywhere else. */
export function unitFor(locale: string): "F" | "C" {
  const region = locale.split(/[-_]/)[1]?.toUpperCase();
  return region && ["US", "LR", "MM", "BS", "BZ", "KY", "PW", "FM", "MH"].includes(region) ? "F" : "C";
}

export function weatherUrl({ lat, lon }: Place, unit: "F" | "C") {
  const q = new URLSearchParams({
    latitude: lat.toFixed(2),
    longitude: lon.toFixed(2),
    current: "temperature_2m,weather_code,is_day",
    daily: "temperature_2m_max,temperature_2m_min",
    temperature_unit: unit === "F" ? "fahrenheit" : "celsius",
    timezone: "auto",
    forecast_days: "1",
  });
  return `https://api.open-meteo.com/v1/forecast?${q}`;
}

export function savedPlace(): Place | null {
  try {
    const p = JSON.parse(localStorage.getItem(PLACE_KEY) ?? "null");
    return p && typeof p.lat === "number" && typeof p.lon === "number" ? p : null;
  } catch {
    return null;
  }
}

export function forgetPlace() {
  localStorage.removeItem(PLACE_KEY);
  localStorage.removeItem(CACHE_KEY);
}

/** Ask the browser for a location (only ever called from a click). Rounded to ~1 km. */
export function locate(): Promise<Place> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("unsupported"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const place = { lat: Math.round(pos.coords.latitude * 100) / 100, lon: Math.round(pos.coords.longitude * 100) / 100 };
        localStorage.setItem(PLACE_KEY, JSON.stringify(place));
        resolve(place);
      },
      reject,
      { maximumAge: 60 * 60 * 1000, timeout: 10_000 },
    );
  });
}

export async function getWeather(place: Place, unit: "F" | "C"): Promise<Weather> {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as Weather | null;
    if (cached && cached.unit === unit && Date.now() - cached.fetchedAt < CACHE_MS) return cached;
  } catch {
    /* ignore a corrupt cache */
  }
  const res = await fetch(weatherUrl(place, unit));
  if (!res.ok) throw new Error(`Weather HTTP ${res.status}`);
  const d = await res.json();
  const w: Weather = {
    temp: Math.round(d.current.temperature_2m),
    high: Math.round(d.daily.temperature_2m_max[0]),
    low: Math.round(d.daily.temperature_2m_min[0]),
    code: d.current.weather_code,
    isDay: d.current.is_day === 1,
    unit,
    fetchedAt: Date.now(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(w));
  return w;
}
