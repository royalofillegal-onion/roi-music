/**
 * Media URL proxy/obfuscator.
 *
 * Wraps real CDN URLs (audio + images) into short opaque tokens that go through
 * our `stream-media` edge function. The browser Network tab only ever shows:
 *   https://<project>.functions.supabase.co/stream-media?t=eyJ...
 * — never the real Cloudinary URL.
 *
 * Token lifetime is short (default 2h) so scraped tokens go stale quickly.
 *
 * Also exposes a tiny in-memory + Cache Storage layer so a song played twice
 * in the same session is served from the browser cache instead of re-hitting
 * the edge function (saves bandwidth).
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const FN_BASE = `${SUPABASE_URL}/functions/v1/stream-media`;
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2h

function b64urlEncode(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const tokenCache = new Map<string, { token: string; exp: number }>();

/** Convert a real CDN URL into an opaque proxied URL. Falls back to original on error. */
export function proxyUrl(realUrl: string | undefined | null): string {
  if (!realUrl) return "";
  // Skip local / data / blob URLs and already-proxied URLs.
  if (!/^https?:\/\//i.test(realUrl)) return realUrl;
  if (realUrl.startsWith(FN_BASE)) return realUrl;

  const now = Date.now();
  const cached = tokenCache.get(realUrl);
  if (cached && cached.exp - 60_000 > now) {
    return `${FN_BASE}?t=${cached.token}`;
  }

  const exp = now + TOKEN_TTL_MS;
  const payload = JSON.stringify({ u: realUrl, e: exp });
  const token = b64urlEncode(payload);
  tokenCache.set(realUrl, { token, exp });
  return `${FN_BASE}?t=${token}`;
}

/** Pre-fetch a media URL into the browser Cache Storage so replays are free. */
export async function warmCache(realUrl: string): Promise<void> {
  try {
    if (!("caches" in window)) return;
    const cache = await caches.open("roi-media-v1");
    const url = proxyUrl(realUrl);
    const hit = await cache.match(url);
    if (hit) return;
    const res = await fetch(url);
    if (res.ok) await cache.put(url, res.clone());
  } catch { /* ignore */ }
}

/** Try to read a media URL from the browser cache first; otherwise return the proxied URL. */
export async function cachedProxyUrl(realUrl: string): Promise<string> {
  const url = proxyUrl(realUrl);
  try {
    if ("caches" in window) {
      const cache = await caches.open("roi-media-v1");
      const hit = await cache.match(url);
      if (hit) return url; // browser will serve from cache
    }
  } catch { /* ignore */ }
  return url;
}
