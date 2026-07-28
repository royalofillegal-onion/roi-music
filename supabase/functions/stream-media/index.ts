// Edge function that proxies Cloudinary (and any allow-listed CDN) media so the
// browser never sees the real URL in the Network tab. Clients pass a short
// opaque token (`t=...`) which decodes to { u: <realUrl>, e: <expiryMs> }.

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Expose-Headers": "content-length, content-range, accept-ranges, content-type",
};

// Only forward to URLs whose host matches one of these.
const ALLOWED_HOSTS = [
  "res.cloudinary.com",
  "cloudinary.com",
];

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return atob(b64);
}

interface Token { u: string; e: number }

function decodeToken(t: string): Token | null {
  try {
    const json = b64urlDecode(t);
    const obj = JSON.parse(json) as Token;
    if (!obj || typeof obj.u !== "string" || typeof obj.e !== "number") return null;
    if (Date.now() > obj.e) return null; // expired
    const host = new URL(obj.u).hostname;
    if (!ALLOWED_HOSTS.some((h) => host === h || host.endsWith("." + h))) return null;
    return obj;
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const t = url.searchParams.get("t");
  if (!t) {
    return new Response("missing token", { status: 400, headers: corsHeaders });
  }

  const tok = decodeToken(t);
  if (!tok) {
    return new Response("invalid or expired token", { status: 403, headers: corsHeaders });
  }

  // Forward Range header for audio seeking.
  const fwdHeaders: Record<string, string> = {};
  const range = req.headers.get("range");
  if (range) fwdHeaders["Range"] = range;

  try {
    const upstream = await fetch(tok.u, { method: req.method, headers: fwdHeaders });
    const headers = new Headers(corsHeaders);
    const passthrough = ["content-type", "content-length", "content-range", "accept-ranges", "cache-control", "etag", "last-modified"];
    for (const h of passthrough) {
      const v = upstream.headers.get(h);
      if (v) headers.set(h, v);
    }
    // Aggressive client cache — media is immutable by token+url.
    if (!headers.has("cache-control")) headers.set("cache-control", "public, max-age=86400, immutable");

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (e) {
    return new Response("upstream fetch failed: " + (e as Error).message, { status: 502, headers: corsHeaders });
  }
});
