// Collaborative-filtering recommendations using Jaccard similarity over
// each user's liked + played song set.
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
function b64uDecode(s: string) { s = s.replace(/-/g,"+").replace(/_/g,"/"); while(s.length%4)s+="="; return Uint8Array.from(atob(s),c=>c.charCodeAt(0)); }
function b64u(b: Uint8Array){return btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
async function sign(d: string){const k=await crypto.subtle.importKey("raw",enc.encode(SERVICE_ROLE),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64u(new Uint8Array(await crypto.subtle.sign("HMAC",k,enc.encode(d))));}
async function verifyToken(token?: string){if(!token)return null;const p=token.split(".");if(p.length!==3)return null;if((await sign(`${p[0]}.${p[1]}`))!==p[2])return null;try{const pay=JSON.parse(dec.decode(b64uDecode(p[1])));if(pay.exp&&pay.exp<Math.floor(Date.now()/1000))return null;return{sub:pay.sub,app_id:pay.app_id};}catch{return null;}}
function json(d: unknown, s: number){return new Response(JSON.stringify(d),{status:s,headers:{...corsHeaders,"Content-Type":"application/json"}});}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { token } = await req.json().catch(() => ({}));
    const v = await verifyToken(token);
    if (!v) return json({ error: "Invalid session." }, 401);

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Build the current user's preference set: liked + recently played (last 30 days).
    const [likedRes, playedRes] = await Promise.all([
      sb.from("liked_songs").select("song_id").eq("user_id", v.sub),
      sb.from("play_events").select("song_id").eq("user_id", v.sub).gte("played_at", new Date(Date.now() - 30*24*3600*1000).toISOString()),
    ]);
    const mine = new Set<string>([
      ...(likedRes.data ?? []).map(r => r.song_id),
      ...(playedRes.data ?? []).map(r => r.song_id),
    ]);
    if (mine.size === 0) return json({ recommendations: [], reason: "cold_start" }, 200);

    // Fetch all other users' liked + recently played songs (cap rows to avoid runaway).
    const [allLiked, allPlayed] = await Promise.all([
      sb.from("liked_songs").select("user_id, song_id").neq("user_id", v.sub).limit(10000),
      sb.from("play_events").select("user_id, song_id, played_at")
        .neq("user_id", v.sub)
        .gte("played_at", new Date(Date.now() - 30*24*3600*1000).toISOString())
        .limit(10000),
    ]);

    const userSets = new Map<string, Set<string>>();
    for (const row of (allLiked.data ?? [])) {
      const set = userSets.get(row.user_id) ?? new Set<string>();
      set.add(row.song_id); userSets.set(row.user_id, set);
    }
    for (const row of (allPlayed.data ?? [])) {
      const set = userSets.get(row.user_id) ?? new Set<string>();
      set.add(row.song_id); userSets.set(row.user_id, set);
    }

    if (userSets.size === 0) return json({ recommendations: [], reason: "no_peers" }, 200);

    // Jaccard similarity per peer.
    type Peer = { user_id: string; sim: number; songs: Set<string> };
    const peers: Peer[] = [];
    for (const [uid, set] of userSets) {
      let inter = 0;
      for (const s of set) if (mine.has(s)) inter++;
      if (inter === 0) continue;
      const union = mine.size + set.size - inter;
      const sim = inter / union;
      peers.push({ user_id: uid, sim, songs: set });
    }
    peers.sort((a, b) => b.sim - a.sim);
    const top = peers.slice(0, 20);

    // Weighted vote for songs the user hasn't heard.
    const scores = new Map<string, number>();
    for (const peer of top) {
      for (const sid of peer.songs) {
        if (mine.has(sid)) continue;
        scores.set(sid, (scores.get(sid) ?? 0) + peer.sim);
      }
    }
    const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
    return json({
      recommendations: ranked.map(([song_id, score]) => ({ song_id, score })),
      peer_count: peers.length,
    }, 200);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
