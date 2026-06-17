import { useEffect, useState } from "react";

interface LocationState {
  city: string | null;
  loading: boolean;
}

/**
 * Lightweight reverse-geocoded location hook.
 * Uses browser geolocation + OpenStreetMap Nominatim (no API key).
 * Result is cached in localStorage for 24h.
 */
export function useLocation(): LocationState {
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const CACHE_KEY = "user-location-cache";
    const TTL = 24 * 60 * 60 * 1000;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { city: c, ts } = JSON.parse(cached);
        if (c && Date.now() - ts < TTL) {
          setCity(c);
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore */ }

    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const name =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.county ||
            addr.state ||
            null;
          if (name) {
            setCity(name);
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ city: name, ts: Date.now() })
            );
          }
        } catch { /* ignore */ }
        setLoading(false);
      },
      () => setLoading(false),
      { timeout: 8000, maximumAge: 60 * 60 * 1000 }
    );
  }, []);

  return { city, loading };
}
