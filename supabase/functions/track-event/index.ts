// Records play / like / unlike events for the signed-in App ID user.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64uDecode(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}
function b64u(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(SERVICE_ROLE), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64u(new Uint8Array(sig));
}
async function verifyToken(token: string | undefined): Promise<{ sub: string; app_id: string } | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  if ((await sign(`${h}.${p}`)) !== s) return null;
  try {
    const payload = JSON.parse(dec.decode(b64uDecode(p)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, app_id: payload.app_id };
  } catch { return null; }
}
function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const { token, type, song, listened_seconds = 0, skipped = false } = body as any;

    const v = await verifyToken(token);
    if (!v) return json({ error: "Invalid session." }, 401);
    if (!song?.id) return json({ error: "Missing song." }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const meta = {
      song_id: String(song.id),
      title: song.title ?? null,
      artist: song.artist ?? null,
      album: song.album ?? null,
      genre: song.genre ?? null,
      sync: song.sync ?? null,
      language: song.language ?? null,
    };

    if (type === "play") {
      await supabase.from("play_events").insert({
        user_id: v.sub, ...meta,
        listened_seconds: Math.max(0, Math.floor(Number(listened_seconds) || 0)),
        skipped: !!skipped,
      });
      return json({ ok: true }, 200);
    }
    if (type === "like") {
      await supabase.from("liked_songs").upsert({ user_id: v.sub, ...meta });
      return json({ ok: true }, 200);
    }
    if (type === "unlike") {
      await supabase.from("liked_songs").delete().eq("user_id", v.sub).eq("song_id", meta.song_id);
      return json({ ok: true }, 200);
    }
    return json({ error: "Unknown event type." }, 400);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
