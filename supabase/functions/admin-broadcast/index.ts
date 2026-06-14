// Admin-only: post a broadcast message that all users receive in real time.
// Expires automatically after 24h (column default).
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
    const { token, title, body, link } = await req.json().catch(() => ({}));
    const v = await verifyToken(token);
    if (!v) return json({ error: "Invalid session." }, 401);
    if (!title || !body) return json({ error: "Title and body are required." }, 400);
    if (String(title).length > 120 || String(body).length > 1000) return json({ error: "Message too long." }, 400);

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", v.sub);
    if (!roles?.some(r => r.role === "admin")) return json({ error: "Admin only." }, 403);

    const { data, error } = await sb.from("broadcasts")
      .insert({ title: String(title).slice(0,120), body: String(body).slice(0,1000), link: link ? String(link).slice(0,500) : null, created_by: v.sub })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);

    // Best-effort cleanup of expired broadcasts each post.
    await sb.from("broadcasts").delete().lt("expires_at", new Date().toISOString());

    return json({ broadcast: data }, 200);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
