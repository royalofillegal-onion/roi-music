// First-launch / login screen. App ID + secret code, no email.
import { useState } from "react";
import { Music2, Eye, EyeOff } from "lucide-react";
import { invokeFn, saveSession } from "@/lib/session";

export function AuthGate({ onAuthed }: { onAuthed?: () => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [appId, setAppId] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const id = appId.trim();
    if (!/^[a-z0-9_]{3,20}$/i.test(id)) { setErr("App ID must be 3–20 chars (letters, numbers, underscore)."); return; }
    if (secret.length < 4) { setErr("Secret code must be at least 4 characters."); return; }
    setLoading(true);
    try {
      const res = await invokeFn<{ token?: string; user?: any; is_admin?: boolean; error?: string }>(
        "auth-appid", { action: mode, app_id: id, secret_code: secret }
      );
      if (res?.error || !res.token || !res.user) {
        setErr(res?.error ?? "Something went wrong.");
      } else {
        saveSession(res.token, res.user, !!res.is_admin);
        onAuthed?.();
      }
    } catch (e: any) {
      setErr(e?.message ?? "Network error.");
    } finally { setLoading(false); }
  };

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-10"
      style={{ background: "radial-gradient(120% 80% at 50% -10%, #4a1f7a 0%, #2a0d4d 35%, #0a0418 75%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/40 mb-4">
            <Music2 className="h-8 w-8 text-fuchsia-300" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Roi Music</h1>
          <p className="mt-1.5 text-sm text-white/65">
            {mode === "signup" ? "Pick a unique Roi ID and a secret code." : "Sign in with your Roi ID."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-white/55">Your Roi ID</span>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value.replace(/\s+/g, ""))}
              placeholder="e.g. moon_walker"
              autoComplete="username"
              maxLength={20}
              className="mt-1 w-full rounded-xl bg-white/8 border border-white/15 px-4 py-3 text-base outline-none focus:border-fuchsia-400/60 focus:bg-white/10"
            />
          </label>
          <label className="block relative">
            <span className="text-xs uppercase tracking-wide text-white/55">Secret code</span>
            <input
              type={showSecret ? "text" : "password"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="At least 4 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="mt-1 w-full rounded-xl bg-white/8 border border-white/15 px-4 py-3 pr-12 text-base outline-none focus:border-fuchsia-400/60 focus:bg-white/10"
            />
            <button
              type="button"
              onClick={() => setShowSecret(s => !s)}
              className="absolute right-3 top-[34px] grid h-9 w-9 place-items-center rounded-lg text-white/60 hover:text-white"
              aria-label={showSecret ? "Hide secret" : "Show secret"}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </label>

          {err && (
            <p className="rounded-lg bg-red-500/15 border border-red-400/30 px-3 py-2 text-xs text-red-200">{err}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-500/30 disabled:opacity-50 transition"
          >
            {loading ? "Please wait…" : mode === "signup" ? "Create Roi ID" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErr(null); }}
            className="w-full text-center text-sm text-white/60 hover:text-white/90 py-2"
          >
            {mode === "signup" ? "Already have a Roi ID? Sign in" : "New here? Create a Roi ID"}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] text-white/40">
          Remember your secret code — it can't be recovered. There's no email reset.
        </p>
      </div>
    </main>
  );
}
