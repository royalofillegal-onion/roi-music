// Custom App ID + secret code auth. No Supabase Auth used.
// Issues an HMAC-signed session token that other edge functions verify.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_APP_ID = "roi_admin"; // The unique app ID that becomes admin on signup.
const TOKEN_TTL_SEC = 60 * 60 * 24 * 90; // 90 days

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64u(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? enc.encode(input) : input;
  let s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64uDecode(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function sign(secret: string, data: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64u(new Uint8Array(sig));
}
export async function makeToken(userId: string, appId: string): Promise<string> {
  const header = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64u(JSON.stringify({ sub: userId, app_id: appId, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC }));
  const sig = await sign(SERVICE_ROLE, `${header}.${payload}`);
  return `${header}.${payload}.${sig}`;
}

async function pbkdf2(secret: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 100_000, hash: "SHA-256" },
    key, 256
  );
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, "0")).join("");
}
async function hashSecret(secret: string): Promise<string> {
  const salt = b64u(crypto.getRandomValues(new Uint8Array(16)));
  const h = await pbkdf2(secret, salt);
  return `${salt}:${h}`;
}
async function verifySecret(secret: string, stored: string): Promise<boolean> {
  const [salt, h] = stored.split(":");
  if (!salt || !h) return false;
  const test = await pbkdf2(secret, salt);
  return test === h;
}

const APP_ID_RE = /^[a-z0-9_]{3,20}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { action, app_id, secret_code, token } = body as Record<string, string>;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // --- verify existing token --------------------------------------------------
    if (action === "verify") {
      const v = await verifyToken(token);
      if (!v) return json({ valid: false }, 200);
      const { data: user } = await supabase
        .from("app_users")
        .select("id, app_id, display_name, created_at")
        .eq("id", v.sub)
        .maybeSingle();
      if (!user) return json({ valid: false }, 200);
      // touch last_seen
      await supabase.from("app_users").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const is_admin = !!roles?.some(r => r.role === "admin");
      return json({ valid: true, user, is_admin }, 200);
    }

    // --- signup / login validate ------------------------------------------------
    if (!app_id || !secret_code) return json({ error: "App ID and secret code are required." }, 400);
    if (!APP_ID_RE.test(app_id)) return json({ error: "App ID must be 3–20 chars (letters, numbers, underscore)." }, 400);
    if (secret_code.length < 4) return json({ error: "Secret code must be at least 4 characters." }, 400);

    const lower = app_id.toLowerCase();

    if (action === "signup") {
      const { data: existing } = await supabase
        .from("app_users").select("id").eq("app_id_lower", lower).maybeSingle();
      if (existing) return json({ error: "That App ID is already taken." }, 409);

      const secret_hash = await hashSecret(secret_code);
      const { data: created, error } = await supabase
        .from("app_users")
        .insert({ app_id, app_id_lower: lower, secret_hash, display_name: app_id })
        .select("id, app_id, display_name, created_at")
        .single();
      if (error || !created) return json({ error: error?.message ?? "Could not create account." }, 500);

      // Auto-grant admin to the reserved ID
      if (lower === ADMIN_APP_ID) {
        await supabase.from("user_roles").insert({ user_id: created.id, role: "admin" });
      }

      const t = await makeToken(created.id, created.app_id);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", created.id);
      return json({ token: t, user: created, is_admin: !!roles?.some(r => r.role === "admin") }, 200);
    }

    if (action === "login") {
      const { data: user } = await supabase
        .from("app_users").select("id, app_id, secret_hash, display_name, created_at")
        .eq("app_id_lower", lower).maybeSingle();
      if (!user) return json({ error: "Invalid App ID or secret code." }, 401);
      const ok = await verifySecret(secret_code, user.secret_hash);
      if (!ok) return json({ error: "Invalid App ID or secret code." }, 401);

      await supabase.from("app_users").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id);
      const t = await makeToken(user.id, user.app_id);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const { secret_hash: _omit, ...safeUser } = user;
      return json({ token: t, user: safeUser, is_admin: !!roles?.some(r => r.role === "admin") }, 200);
    }

    return json({ error: "Unknown action." }, 400);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

export async function verifyToken(token: string | undefined): Promise<{ sub: string; app_id: string } | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = await sign(SERVICE_ROLE, `${h}.${p}`);
  if (expected !== s) return null;
  try {
    const payload = JSON.parse(dec.decode(b64uDecode(p)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, app_id: payload.app_id };
  } catch { return null; }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
