import { useMemo } from "react";
import { Heart, ListMusic, LogOut, Cloud, CheckCircle2, Flame, Clock3, Radio, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { usePlaylists } from "@/lib/playlistStore";
import { useListeningStats, clearStats } from "@/lib/listeningStats";
import { buildBlendRadio } from "@/lib/radio";
import { uniqueSongs } from "@/data/allSongs";
import type { Song } from "@/data/Song";

export function ProfileView({ onSignIn, onClose }: { onSignIn: () => void; onClose?: () => void }) {
  const { user, signOut } = useAuth();
  const { likedSongs, recentlyPlayed, playPlaylist } = usePlayer();
  const { playlists } = usePlaylists();
  const stats = useListeningStats();

  const displayName = useMemo(() => {
    const meta = (user?.user_metadata ?? {}) as Record<string, string>;
    return meta.name || meta.full_name || user?.email?.split("@")[0] || "Listener";
  }, [user]);

  const initials = displayName.slice(0, 2).toUpperCase();

  const startBlend = () => {
    const seeds = (uniqueSongs as Song[]).filter((s) => likedSongs.includes(s.id));
    const station = buildBlendRadio(seeds.length ? seeds : (recentlyPlayed as Song[]));
    if (station.length) playPlaylist(station);
    else toast.info("Play or like a few songs first");
  };

  const statsPanel = (
    <>
      <section className="mt-8 text-left">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Your listening</h2>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <Stat icon={Clock3} label="Minutes" value={stats.totalMinutes} />
          <Stat icon={Flame} label="Day streak" value={stats.streakDays} />
          <Stat icon={CheckCircle2} label="Plays" value={stats.totalPlays} />
        </div>

        <div className="mt-4 rounded-2xl border border-white/8 bg-zinc-900/70 p-4">
          <p className="text-[11px] uppercase tracking-widest text-zinc-500">This week</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {stats.weekMinutes}
            <span className="ml-1 text-sm font-medium text-zinc-500">min</span>
          </p>
          <div className="mt-4 flex h-20 items-end gap-2">
            {stats.perDay.map((d, i) => {
              const max = Math.max(1, ...stats.perDay.map((x) => x.minutes));
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-red-900 to-red-600"
                    style={{ height: `${Math.max(4, (d.minutes / max) * 64)}px` }}
                  />
                  <span className="text-[10px] text-zinc-600">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={startBlend}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_24px_rgba(220,38,38,0.35)]"
        >
          <Radio className="h-4 w-4" /> Start my radio
        </button>
      </section>

      {stats.topArtists.length > 0 && (
        <section className="mt-8 text-left">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Top artists</h2>
          <ul className="mt-3 space-y-2">
            {stats.topArtists.map((a, i) => (
              <li
                key={a.key}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-zinc-900/70 p-2.5"
              >
                <span className="w-5 text-center text-sm font-black text-red-600">{i + 1}</span>
                <img src={a.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{a.label}</span>
                <span className="text-[11px] text-zinc-500">{Math.round(a.seconds / 60)} min</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stats.topSongs.length > 0 && (
        <section className="mt-8 text-left">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Top songs</h2>
          <ul className="mt-3 space-y-2">
            {stats.topSongs.map((s, i) => (
              <li key={s.key} className="flex items-center gap-3">
                <span className="w-5 text-center text-sm font-black text-zinc-700">{i + 1}</span>
                <img src={s.imageUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-zinc-100">{s.label}</span>
                  <span className="block truncate text-[11px] text-zinc-500">{s.sub}</span>
                </span>
                <span className="text-[11px] text-zinc-500">{s.plays}×</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              clearStats();
              toast.success("Listening history cleared");
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-[11px] font-semibold text-zinc-400"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear history
          </button>
        </section>
      )}
    </>
  );

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
        {statsPanel}
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

      {statsPanel}

      <button
        onClick={async () => {
          await signOut();
          toast.success("Signed out");
        }}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 py-3.5 text-sm font-semibold text-white"
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
