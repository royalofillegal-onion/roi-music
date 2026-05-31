import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Music2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-5.1c-2 1.4-4.4 2.2-6.9 2.2-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6 5.1C40.9 35.4 43.5 30.2 43.5 24c0-1.2-.1-2.4 0-3.5z"/>
  </svg>
);

export default function Auth() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Welcome back!");
      } else {
        await signUp(email, password, displayName || undefined);
        toast.success("Account created");
      }
    } catch (err: any) {
      toast.error(err?.message?.replace("Firebase: ", "") ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google");
    } catch (err: any) {
      toast.error(err?.message?.replace("Firebase: ", "") ?? "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated gradient backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1a] via-[#1a0b2e] to-[#0a0612]" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-600/30 blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 right-1/4 w-[30%] h-[30%] rounded-full bg-fuchsia-500/20 blur-[100px] animate-pulse" style={{ animationDelay: "0.7s" }} />
      </div>

      <div className="w-full max-w-md">
        {/* Logo + greeting */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 grid place-items-center shadow-[0_0_60px_rgba(168,85,247,0.5)] mb-4">
            <Music2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
            ROI Music
          </h1>
          <p className="text-sm text-white/60 mt-2">
            {mode === "login" ? "Welcome back. Let's continue your journey." : "Create an account to start listening."}
          </p>
        </div>

        {/* Glass card */}
        <div className="backdrop-blur-2xl bg-white/[0.04] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] animate-scale-in">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
            <TabsList className="grid grid-cols-2 w-full bg-white/5 border border-white/10 rounded-2xl p-1 h-12 mb-6">
              <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <Button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              variant="outline"
              className="w-full h-12 bg-white text-gray-900 hover:bg-white/90 border-0 rounded-2xl font-medium shadow-lg"
            >
              <GoogleIcon />
              <span className="ml-2">Continue with Google</span>
            </Button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/40 uppercase tracking-wider">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleEmail} className="space-y-4">
              <TabsContent value="signup" className="m-0">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 pl-11 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/40 focus-visible:ring-purple-500/50"
                  />
                </div>
              </TabsContent>

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

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 pl-11 pr-11 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/40 focus-visible:ring-purple-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === "login" && (
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-purple-300 hover:text-pink-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                disabled={busy}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-600 text-white font-semibold shadow-[0_10px_30px_-10px_rgba(236,72,153,0.6)] border-0"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Tabs>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          By continuing you agree to our{" "}
          <Link to="/terms" className="text-white/60 hover:text-white underline">Terms</Link>.
        </p>
      </div>
    </div>
  );
}
