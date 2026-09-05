import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup" | "reset";

export function AuthView({ onClose }: { onClose: () => void }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "reset") {
        const { error } = await resetPassword(email.trim());
        if (error) toast.error(error);
        else toast.success("Check your inbox for the reset link");
      } else if (mode === "signup") {
        const { error } = await signUpWithEmail(email.trim(), password, name.trim());
        if (error) toast.error(error);
        else toast.success("Account created — check your email to confirm");
      } else {
        const { error } = await signInWithEmail(email.trim(), password);
        if (error) toast.error(error);
        else {
          toast.success("Welcome back");
          onClose();
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error);
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh bg-black px-6 pt-16 pb-24">
      <button onClick={onClose} className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        {mode === "signup" ? "Create account" : mode === "reset" ? "Reset password" : "Sign in"}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Keep your liked songs and playlists on every device.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {mode === "signup" && (
          <Field icon={UserIcon}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </Field>
        )}
        <Field icon={Mail}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
          />
        </Field>
        {mode !== "reset" && (
          <Field icon={Lock}>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </Field>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_24px_rgba(220,38,38,0.35)] disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}
        </button>
      </form>

      {mode !== "reset" && (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <button
            onClick={google}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/5 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] font-black text-black">G</span>
            Continue with Google
          </button>
        </>
      )}

      <div className="mt-8 space-y-2 text-center text-xs text-zinc-500">
        {mode !== "signin" && (
          <button onClick={() => setMode("signin")} className="block w-full">
            Already have an account? <span className="font-semibold text-red-500">Sign in</span>
          </button>
        )}
        {mode !== "signup" && (
          <button onClick={() => setMode("signup")} className="block w-full">
            New here? <span className="font-semibold text-red-500">Create an account</span>
          </button>
        )}
        {mode === "signin" && (
          <button onClick={() => setMode("reset")} className="block w-full text-zinc-600">
            Forgot your password?
          </button>
        )}
      </div>
    </main>
  );
}

function Field({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return (
    <label className={cn("flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 px-4 py-3.5")}>
      <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
      {children}
    </label>
  );
}
