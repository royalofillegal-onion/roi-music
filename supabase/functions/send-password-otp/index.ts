// Edge function: generate a 6-digit OTP, store its hash, email it via Resend.
// Public endpoint (no JWT). Rate-limited per-email by checking recent rows.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const db = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Rate limit: max 3 OTPs per email per 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await db
      .from("password_otps")
      .select("id", { count: "exact", head: true })
      .eq("email", email.toLowerCase())
      .gte("created_at", tenMinAgo);
    if ((count ?? 0) >= 3) {
      return new Response(JSON.stringify({ error: "Too many requests. Try again in a few minutes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await sha256(`${email.toLowerCase()}:${otp}`);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Invalidate any unused OTPs for this email
    await db.from("password_otps").update({ used: true }).eq("email", email.toLowerCase()).eq("used", false);

    const { error: insErr } = await db.from("password_otps").insert({
      email: email.toLowerCase(),
      code_hash: codeHash,
      expires_at: expiresAt,
    });
    if (insErr) throw insErr;

    // Send email via Resend
    const html = `
      <!doctype html><html><body style="background:#0f0a1a;color:#fff;font-family:Arial,sans-serif;padding:32px">
        <div style="max-width:480px;margin:0 auto;background:linear-gradient(135deg,#1a0b2e,#2a1248);border-radius:24px;padding:32px;border:1px solid rgba(168,85,247,0.3)">
          <h1 style="margin:0 0 16px;font-size:24px;background:linear-gradient(90deg,#a855f7,#ec4899);-webkit-background-clip:text;color:transparent">ROI Music</h1>
          <p style="margin:0 0 8px;color:#cbd5e1">Your password reset code is:</p>
          <p style="font-size:42px;font-weight:bold;letter-spacing:0.3em;color:#ec4899;text-align:center;margin:24px 0;font-family:monospace">${otp}</p>
          <p style="color:#94a3b8;font-size:13px;margin:16px 0 0">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      </body></html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ROI Music <onboarding@resend.dev>",
        to: [email],
        subject: `${otp} is your ROI Music password reset code`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const text = await resendRes.text();
      console.error("Resend error:", text);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
