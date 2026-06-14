import { useEffect, useState } from "react";

export interface WeatherInfo {
  city: string | null;
  country: string | null;
  tempC: number | null;
  condition: string | null;
  emoji: string;
  isDay: boolean;
  /** Suggested mood tag — maps to song.sync values */
  mood: "happy" | "love" | "sad" | "feel1" | "dance" | "devotional" | "mass";
  loading: boolean;
}

// WMO weather codes -> {label, emoji, mood}
function describeCode(code: number, isDay: boolean): { label: string; emoji: string; mood: WeatherInfo["mood"] } {
  if (code === 0) return { label: "Clear", emoji: isDay ? "☀️" : "🌙", mood: isDay ? "happy" : "love" };
  if (code === 1) return { label: "Mostly clear", emoji: isDay ? "🌤️" : "🌙", mood: "happy" };
  if (code === 2) return { label: "Partly cloudy", emoji: "⛅", mood: "love" };
  if (code === 3) return { label: "Overcast", emoji: "☁️", mood: "feel1" };
  if (code === 45 || code === 48) return { label: "Foggy", emoji: "🌫️", mood: "feel1" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", emoji: "🌦️", mood: "sad" };
  if (code >= 61 && code <= 67) return { label: "Rain", emoji: "🌧️", mood: "sad" };
  if (code >= 71 && code <= 77) return { label: "Snow", emoji: "❄️", mood: "devotional" };
  if (code >= 80 && code <= 82) return { label: "Showers", emoji: "🌧️", mood: "sad" };
  if (code === 85 || code === 86) return { label: "Snow showers", emoji: "🌨️", mood: "devotional" };
  if (code === 95) return { label: "Thunderstorm", emoji: "⛈️", mood: "mass" };
  if (code === 96 || code === 99) return { label: "Thunder + hail", emoji: "⛈️", mood: "mass" };
  return { label: "Weather", emoji: "🌡️", mood: "happy" };
}

interface Coords { lat: number; lon: number; city?: string; country?: string }

async function getCoordsFromBrowser(): Promise<Coords | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(null),
      { timeout: 6000, maximumAge: 60 * 60 * 1000 }
    );
  });
}

async function getCoordsFromIP(): Promise<Coords | null> {
  // Free, no API key, CORS-enabled fallback used when geolocation is denied.
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("ipapi failed");
    const d = await res.json();
    if (typeof d.latitude !== "number") return null;
    return { lat: d.latitude, lon: d.longitude, city: d.city, country: d.country_name };
  } catch {
    try {
      const res2 = await fetch("https://ipwho.is/");
      const d = await res2.json();
      if (!d?.success) return null;
      return { lat: d.latitude, lon: d.longitude, city: d.city, country: d.country };
    } catch { return null; }
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string | null; country: string | null }> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`
    );
    const d = await res.json();
    const r = d?.results?.[0];
    if (!r) return { city: null, country: null };
    return { city: r.name || r.admin1 || null, country: r.country || null };
  } catch {
    return { city: null, country: null };
  }
}

async function fetchWeather(lat: number, lon: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`
  );
  if (!res.ok) throw new Error("weather failed");
  return res.json();
}

const CACHE_KEY = "weather-cache-v2";
const TTL = 30 * 60 * 1000; // 30 min

export function useWeather(): WeatherInfo {
  const [state, setState] = useState<WeatherInfo>({
    city: null, country: null, tempC: null, condition: null,
    emoji: "🌤️", isDay: true, mood: "happy", loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    // Try cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (data && Date.now() - ts < TTL) {
          setState({ ...data, loading: false });
          return;
        }
      }
    } catch { /* ignore */ }

    (async () => {
      // Skip browser geolocation prompt — use IP-based location silently.
      const coords = await getCoordsFromIP();
      if (!coords) {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
        return;
      }

      try {
        let { city, country } = coords;
        if (!city) {
          const geo = await reverseGeocode(coords.lat, coords.lon);
          city = geo.city ?? undefined;
          country = geo.country ?? undefined;
        }

        const w = await fetchWeather(coords.lat, coords.lon);
        const cur = w.current || {};
        const code = Number(cur.weather_code ?? 0);
        const isDay = Number(cur.is_day ?? 1) === 1;
        const desc = describeCode(code, isDay);
        const tempC = typeof cur.temperature_2m === "number" ? Math.round(cur.temperature_2m) : null;

        const data: Omit<WeatherInfo, "loading"> = {
          city: city || null,
          country: country || null,
          tempC,
          condition: desc.label,
          emoji: desc.emoji,
          isDay,
          mood: desc.mood,
        };

        if (!cancelled) {
          setState({ ...data, loading: false });
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
          } catch { /* ignore */ }
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return state;
}
