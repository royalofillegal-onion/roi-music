import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, KeyRound, Lock, ArrowLeft, Music2, Check } from "lucide-react";

type Step = "email" | "otp" | "done";

export default function ForgotPassword() {
  const { requestPasswordOtp, verifyOtpAndResetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await requestPasswordOtp(email);
      toast.success("Code sent — check your email");
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't send code");
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (otp.length !== 6) return toast.error("Enter the 6-digit code");
    if (newPw.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    try {
      await verifyOtpAndResetPassword(email, otp, newPw);
      setStep("done");
      setTimeout(() => navigate("/auth", { replace: true }), 2000);
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't reset password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1a] via-[#1a0b2e] to-[#0a0612]" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-600/30 blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="w-full max-w-md">
        <Link to="/auth" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 grid place-items-center shadow-[0_0_60px_rgba(168,85,247,0.5)] mb-4">
            <Music2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
        </div>

        <div className="backdrop-blur-2xl bg-white/[0.04] border border-white/10 rounded-[28px] p-6 shadow-2xl animate-scale-in">
          {step === "email" && (
            <form onSubmit={handleSend} className="space-y-4">
              <p className="text-sm text-white/60">Enter your email and we'll send you a 6-digit verification code.</p>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-11 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/40 focus-visible:ring-purple-500/50"
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white font-semibold border-0 shadow-[0_10px_30px_-10px_rgba(236,72,153,0.6)]">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send code"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-white/60">Enter the 6-digit code sent to <span className="text-white">{email}</span> and choose a new password.</p>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  className="h-14 pl-11 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/30 text-center text-2xl tracking-[0.5em] font-mono focus-visible:ring-purple-500/50"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 pl-11 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/40 focus-visible:ring-purple-500/50"
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white font-semibold border-0">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset password"}
              </Button>
              <button type="button" onClick={() => setStep("email")} className="w-full text-xs text-white/50 hover:text-white/80">
                Didn't get the code? Try a different email
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="text-center py-6">
              <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 grid place-items-center mb-4">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Password updated</h2>
              <p className="text-sm text-white/60 mt-2">Redirecting you to sign in…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
