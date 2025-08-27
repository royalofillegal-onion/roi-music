
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  otp: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, userName }: PasswordResetRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Roix Music Security <security@roixmusic.com>",
      to: [email],
      subject: "Password Change Verification - Roix Music",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Password Change Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #1a1a1a;">
              <h1 style="color: #22d3ee; margin: 0; font-size: 28px; font-weight: bold;">🎵 Roix Music</h1>
              <p style="color: #888; margin: 10px 0 0 0; font-size: 16px;">Your Premium Music Platform</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 20px; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); border-radius: 12px; margin: 20px 0;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="background: #22d3ee; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span style="font-size: 24px;">🔐</span>
                </div>
                <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 24px;">Password Change Verification</h2>
                <p style="color: #cccccc; margin: 0; font-size: 16px;">Secure your account with verification</p>
              </div>
              
              <div style="background: #333333; padding: 25px; border-radius: 8px; border-left: 4px solid #22d3ee; margin: 20px 0;">
                <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 16px;">
                  Hello ${userName || 'Music Lover'},
                </p>
                <p style="color: #cccccc; margin: 0 0 20px 0; font-size: 14px; line-height: 1.6;">
                  You've requested to change your password on Roix Music. For your security, please use the verification code below to confirm this change.
                </p>
                
                <div style="text-align: center; margin: 25px 0;">
                  <div style="background: #22d3ee; color: #000000; font-size: 32px; font-weight: bold; padding: 15px 25px; border-radius: 8px; letter-spacing: 8px; display: inline-block; font-family: 'Courier New', monospace;">
                    ${otp}
                  </div>
                </div>
                
                <p style="color: #cccccc; margin: 20px 0 0 0; font-size: 12px; text-align: center;">
                  This code expires in 10 minutes for your security
                </p>
              </div>
              
              <!-- Security Notice -->
              <div style="background: #2a1f1f; border: 1px solid #d97706; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 18px; margin-right: 10px;">⚠️</span>
                  <h3 style="color: #f59e0b; margin: 0; font-size: 16px;">Security Notice</h3>
                </div>
                <p style="color: #fbbf24; margin: 0; font-size: 14px; line-height: 1.5;">
                  If you didn't request this password change, please ignore this email and consider securing your account. Your current password remains unchanged.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #333;">
              <p style="color: #888; margin: 0 0 10px 0; font-size: 14px;">
                This email was sent by Roix Music Security Team
              </p>
              <p style="color: #666; margin: 0; font-size: 12px;">
                © 2024 Roix Music Platform. All rights reserved.
              </p>
              <div style="margin-top: 15px;">
                <a href="#" style="color: #22d3ee; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy Policy</a>
                <a href="#" style="color: #22d3ee; text-decoration: none; margin: 0 10px; font-size: 12px;">Terms of Service</a>
                <a href="#" style="color: #22d3ee; text-decoration: none; margin: 0 10px; font-size: 12px;">Support</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
