// Admin-only stats dashboard. Verifies the caller has the `admin` role.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const enc = new TextEncoder(); const dec = new TextDecoder();
function b64uDecode(s: string){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
function b64u(b: Uint8Array){return btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
async function sign(d: string){const k=await crypto.subtle.importKey("raw",enc.encode(SERVICE_ROLE),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64u(new Uint8Array(await crypto.subtle.sign("HMAC",k,enc.encode(d))));}
async function verifyToken(token?: string){if(!token)return null;const p=token.split(".");if(p.length!==3)return null;if((await sign(`${p[0]}.${p[1]}`))!==p[2])return null;try{const pay=JSON.parse(dec.decode(b64uDecode(p[1])));if(pay.exp&&pay.exp<Math.floor(Date.now()/1000))return null;return{sub:pay.sub};}catch{return null;}}
function json(d: unknown, s: number){return new Response(JSON.stringify(d),{status:s,headers:{...corsHeaders,"Content-Type":"application/json"}});}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { token } = await req.json().catch(() => ({}));
    const v = await verifyToken(token);
    if (!v) return json({ error: "Invalid session." }, 401);

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", v.sub);
    if (!roles?.some(r => r.role === "admin")) return json({ error: "Admin only." }, 403);

    const now = Date.now();
    const d1 = new Date(now - 24*3600*1000).toISOString();
    const d7 = new Date(now - 7*24*3600*1000).toISOString();
    const d14 = new Date(now - 14*24*3600*1000).toISOString();

    const [
      totalUsers, active24h, active7d, totalPlays, totalLikes, signups14d,
      topSongsRaw, topArtistsRaw, recentUsers, nowPlaying,
    ] = await Promise.all([
      sb.from("app_users").select("id", { count: "exact", head: true }),
      sb.from("app_users").select("id", { count: "exact", head: true }).gte("last_seen_at", d1),
      sb.from("app_users").select("id", { count: "exact", head: true }).gte("last_seen_at", d7),
      sb.from("play_events").select("id", { count: "exact", head: true }),
      sb.from("liked_songs").select("user_id", { count: "exact", head: true }),
      sb.from("app_users").select("created_at").gte("created_at", d14),
      sb.from("play_events").select("song_id, title, artist").gte("played_at", d7).limit(5000),
      sb.from("play_events").select("artist").gte("played_at", d7).limit(5000),
      sb.from("app_users").select("id, app_id, created_at, last_seen_at").order("last_seen_at", { ascending: false }).limit(20),
      sb.from("play_events").select("user_id, song_id, title, artist, played_at").order("played_at", { ascending: false }).limit(15),
    ]);

    // Top songs
    const songMap = new Map<string, { song_id: string; title: string; artist: string; plays: number }>();
    for (const r of (topSongsRaw.data ?? [])) {
      const prev = songMap.get(r.song_id);
      if (prev) prev.plays++;
      else songMap.set(r.song_id, { song_id: r.song_id, title: r.title ?? r.song_id, artist: r.artist ?? "—", plays: 1 });
    }
    const top_songs = [...songMap.values()].sort((a,b)=>b.plays-a.plays).slice(0,10);

    // Top artists
    const artistMap = new Map<string, number>();
    for (const r of (topArtistsRaw.data ?? [])) {
      const a = r.artist ?? "—";
      artistMap.set(a, (artistMap.get(a) ?? 0) + 1);
    }
    const top_artists = [...artistMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([artist, plays])=>({artist, plays}));

    // Signups per day (last 14 days)
    const dayMap = new Map<string, number>();
    for (let i=0;i<14;i++){const d=new Date(now - i*24*3600*1000);dayMap.set(d.toISOString().slice(0,10), 0);}
    for (const r of (signups14d.data ?? [])) {
      const k = r.created_at.slice(0,10);
      dayMap.set(k, (dayMap.get(k) ?? 0) + 1);
    }
    const signups_per_day = [...dayMap.entries()].sort().map(([date, count]) => ({ date, count }));

    return json({
      total_users: totalUsers.count ?? 0,
      active_24h: active24h.count ?? 0,
      active_7d: active7d.count ?? 0,
      total_plays: totalPlays.count ?? 0,
      total_likes: totalLikes.count ?? 0,
      top_songs,
      top_artists,
      signups_per_day,
      recent_users: recentUsers.data ?? [],
      now_playing: nowPlaying.data ?? [],
    }, 200);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
