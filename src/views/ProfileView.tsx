import { useMemo } from "react";
import { Heart, ListMusic, LogOut, Cloud, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { usePlaylists } from "@/lib/playlistStore";

export function ProfileView({ onSignIn }: { onSignIn: () => void }) {
  const { user, signOut } = useAuth();
  const { likedSongs, recentlyPlayed } = usePlayer();
  const { playlists } = usePlaylists();

  const displayName = useMemo(() => {
    const meta = (user?.user_metadata ?? {}) as Record<string, string>;
    return meta.name || meta.full_name || user?.email?.split("@")[0] || "Listener";
  }, [user]);

  const initials = displayName.slice(0, 2).toUpperCase();

  if (!user) {
    return (
      <main className="min-h-dvh bg-black px-6 pt-24 pb-44 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-red-800/60 bg-red-950/40 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
          <Cloud className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Save your music
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-zinc-500">
          Sign in so your liked songs and playlists follow you to any phone or laptop.
        </p>
        <button
          onClick={onSignIn}
          className="mt-8 w-full rounded-2xl bg-red-700 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_24px_rgba(220,38,38,0.35)]"
        >
          Sign in or create an account
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-black px-5 pt-12 pb-44">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full border border-red-800/60 bg-red-950/40 text-lg font-black text-red-400">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {displayName}
          </h1>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat icon={Heart} label="Liked" value={likedSongs.length} />
        <Stat icon={ListMusic} label="Playlists" value={playlists.length} />
        <Stat icon={CheckCircle2} label="Recent" value={recentlyPlayed.length} />
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/8 bg-zinc-900/70 p-4">
        <Cloud className="h-4 w-4 shrink-0 text-red-500" />
        <p className="text-xs text-zinc-400">
          Your liked songs and playlists are saved to your account and stay in sync on every device.
        </p>
      </div>

      <button
        onClick={async () => {
          await signOut();
          toast.success("Signed out");
        }}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 py-3.5 text-sm font-semibold text-white"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-900/70 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-red-500" />
      <p className="mt-1.5 text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
    </div>
  );
}
