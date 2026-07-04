import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  ListMusic,
  Play,
  X,
  Pencil,
  Check,
  Clock,
  TrendingUp,
  Sparkles,
  Music2,
  Share2,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { usePlayer } from "@/context/PlayerContext";
import { uniqueSongs } from "@/data/allSongs";
import { playlists, getPlaylistSongs } from "@/data/playlists";
import { cn } from "@/lib/utils";
import {
  getDeviceId,
  getFirstSeen,
  getTotalPlays,
  getTopPlayed,
  getAllMeta,
} from "@/lib/deviceTracker";
import { Marquee } from "@/components/Marquee";
import type { Song } from "@/data/Song";
import { toast } from "sonner";

type Tab = "overview" | "liked" | "playlists" | "top" | "recent";

const NAME_KEY = "roi.profileName";
const AVATAR_KEY = "roi.profileAvatarIdx";

const AVATAR_GRADIENTS = [
  "from-fuchsia-500 via-purple-500 to-indigo-500",
  "from-rose-500 via-pink-500 to-fuchsia-500",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-emerald-400 via-teal-500 to-cyan-500",
  "from-sky-400 via-blue-500 to-indigo-600",
  "from-lime-400 via-emerald-500 to-teal-500",
];

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function songById(id: string): Song | undefined {
  return uniqueSongs.find((s) => s.id === id);
}

export function LibrarySheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { likedSongs, playSong, playPlaylist, toggleLike } = usePlayer();
  const [tab, setTab] = useState<Tab>("overview");
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState<string>(
    () => localStorage.getItem(NAME_KEY) || "Music Lover"
  );
  const [avatarIdx, setAvatarIdx] = useState<number>(() =>
    Number(localStorage.getItem(AVATAR_KEY) || 0)
  );
  const [, force] = useState(0);

  // refresh stats whenever the sheet opens
  useEffect(() => {
    if (open) force((n) => n + 1);
  }, [open]);

  const liked = useMemo<Song[]>(() => {
    const set = new Set(likedSongs);
    return uniqueSongs.filter((s) => set.has(s.id));
  }, [likedSongs]);

  const topPlayed = useMemo(() => getTopPlayed(20), [open, likedSongs]);
  const totalPlays = useMemo(() => getTotalPlays(), [open, likedSongs]);
  const deviceId = useMemo(() => getDeviceId(), []);
  const firstSeen = useMemo(() => getFirstSeen(), []);

  const recent = useMemo<Song[]>(() => {
    const meta = getAllMeta();
    const withTimes = getTopPlayed(500)
      .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
      .slice(0, 25);
    return withTimes
      .map((c) => songById(c.id))
      .filter(Boolean) as Song[];
  }, [open, likedSongs]);

  const topArtists = useMemo(() => {
    const map = new Map<string, { name: string; plays: number; img?: string }>();
    topPlayed.forEach((t) => {
      if (!t.artist) return;
      const prev = map.get(t.artist);
      map.set(t.artist, {
        name: t.artist,
        plays: (prev?.plays || 0) + t.count,
        img: prev?.img || t.imageUrl,
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 6);
  }, [topPlayed]);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
  const activeSongs = activePlaylist ? getPlaylistSongs(activePlaylist) : [];

  const saveName = () => {
    localStorage.setItem(NAME_KEY, name.trim() || "Music Lover");
    setEditName(false);
  };
  const cycleAvatar = () => {
    const next = (avatarIdx + 1) % AVATAR_GRADIENTS.length;
    setAvatarIdx(next);
    localStorage.setItem(AVATAR_KEY, String(next));
  };

  const daysActive = Math.max(
    1,
    Math.floor((Date.now() - firstSeen) / (1000 * 60 * 60 * 24))
  );

  const shareProfile = async () => {
    const text = `${name} on ROI Music · ${totalPlays} plays · ${liked.length} liked songs 🎧`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ROI Music", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Profile summary copied");
      }
    } catch {
      /* ignore */
    }
  };

  const renderSongRow = (song: Song, i?: number, showHeart = false) => (
    <li
      key={song.id + (i ?? "")}
      onClick={() => {
        playSong(song);
        onOpenChange(false);
      }}
      className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] cursor-pointer transition"
    >
      {typeof i === "number" && (
        <span className="w-5 text-center text-[11px] text-white/40 shrink-0">
          {i + 1}
        </span>
      )}
      <img
        src={song.imageUrl}
        alt=""
        loading="lazy"
        className="h-11 w-11 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <Marquee text={song.title} className="text-sm font-semibold" />
        <p className="text-[11px] text-white/55 truncate">
          {song.singer || song.artist}
        </p>
      </div>
      {showHeart && (
        <button
          aria-label="Unlike"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song.id);
          }}
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"
        >
          <Heart className="h-4 w-4 fill-fuchsia-400 text-fuchsia-400" />
        </button>
      )}
      <button
        aria-label="Play"
        onClick={(e) => {
          e.stopPropagation();
          playSong(song);
          onOpenChange(false);
        }}
        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-fuchsia-500/60 shrink-0 transition"
      >
        <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
      </button>
    </li>
  );

  const StatCard = ({
    icon: Icon,
    label,
    value,
    tint,
  }: {
    icon: any;
    label: string;
    value: string | number;
    tint: string;
  }) => (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div
        className={cn(
          "absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-60",
          tint
        )}
      />
      <Icon className="h-4 w-4 text-white/70" />
      <p className="mt-2 text-lg font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-white/50">
        {label}
      </p>
    </div>
  );

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: Sparkles },
    { id: "liked", label: "Liked", icon: Heart },
    { id: "playlists", label: "Playlists", icon: ListMusic },
    { id: "top", label: "Top", icon: TrendingUp },
    { id: "recent", label: "Recent", icon: Clock },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[#0a0418] border-l border-white/10 text-white p-0 flex flex-col overflow-hidden"
      >
        {/* Hero header */}
        <div
          className="relative px-5 pt-10 pb-5"
          style={{
            background:
              "radial-gradient(120% 90% at 20% 0%, rgba(217,70,239,0.35) 0%, rgba(88,28,135,0.25) 40%, rgba(10,4,24,0) 80%)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={cycleAvatar}
              className={cn(
                "relative h-16 w-16 rounded-full bg-gradient-to-br shadow-xl ring-2 ring-white/20 grid place-items-center text-2xl font-black tracking-tight",
                AVATAR_GRADIENTS[avatarIdx]
              )}
              aria-label="Change avatar"
            >
              {(name || "M").trim().charAt(0).toUpperCase()}
              <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 border border-white/20">
                <Pencil className="h-3 w-3" />
              </span>
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-white/50">
                Profile
              </p>
              {editName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    autoFocus
                    value={name}
                    maxLength={22}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    className="flex-1 min-w-0 bg-white/10 rounded-lg px-2 py-1 text-lg font-extrabold outline-none focus:ring-2 focus:ring-fuchsia-400"
                  />
                  <button
                    onClick={saveName}
                    className="grid h-8 w-8 place-items-center rounded-full bg-fuchsia-500 hover:bg-fuchsia-400"
                    aria-label="Save name"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditName(true)}
                  className="mt-0.5 flex items-center gap-1.5 text-left"
                >
                  <h2 className="text-xl font-extrabold leading-tight truncate">
                    {name}
                  </h2>
                  <Pencil className="h-3.5 w-3.5 text-white/40" />
                </button>
              )}
              <p className="text-[11px] text-white/50 mt-0.5 truncate">
                Since {formatDate(firstSeen)} · {daysActive}d
              </p>
            </div>

            <button
              onClick={() => onOpenChange(false)}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/5 hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stat cards */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatCard
              icon={Music2}
              label="Plays"
              value={totalPlays}
              tint="bg-fuchsia-500/60"
            />
            <StatCard
              icon={Heart}
              label="Liked"
              value={liked.length}
              tint="bg-rose-500/60"
            />
            <StatCard
              icon={Flame}
              label="Streak"
              value={`${daysActive}d`}
              tint="bg-amber-500/60"
            />
          </div>

          {/* Quick actions */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                if (topPlayed.length === 0) {
                  toast("Play something first ✨");
                  return;
                }
                const songs = topPlayed
                  .map((t) => songById(t.id))
                  .filter(Boolean) as Song[];
                playPlaylist(songs);
                onOpenChange(false);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-500 hover:bg-fuchsia-400 px-4 py-2 text-sm font-bold shadow-lg shadow-fuchsia-500/25"
            >
              <Play className="h-4 w-4" fill="currentColor" /> Your Mix
            </button>
            <button
              onClick={shareProfile}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/15 border border-white/10"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/15 border border-white/10"
              aria-label="Settings"
              onClick={() => toast("Settings coming soon")}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-3 border-b border-white/5 overflow-x-auto no-scrollbar">
          <div className="flex gap-1 min-w-max">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setActivePlaylistId(null);
                }}
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition",
                  tab === id ? "text-white" : "text-white/50 hover:text-white/80"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {tab === id && (
                  <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-fuchsia-400 to-pink-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-3 pb-10 pt-3">
          {tab === "overview" && (
            <div className="space-y-5">
              {/* Top artists */}
              <section>
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-sm font-bold">Top Artists</h3>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    This device
                  </span>
                </div>
                {topArtists.length === 0 ? (
                  <p className="px-2 text-xs text-white/50">
                    Play some songs to see your top artists.
                  </p>
                ) : (
                  <div className="flex gap-3 overflow-x-auto no-scrollbar px-2 pb-1">
                    {topArtists.map((a, i) => (
                      <div
                        key={a.name}
                        className="w-20 shrink-0 flex flex-col items-center gap-1.5"
                      >
                        <div className="relative">
                          {a.img ? (
                            <img
                              src={a.img}
                              alt={a.name}
                              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/10"
                            />
                          ) : (
                            <div
                              className={cn(
                                "h-16 w-16 rounded-full bg-gradient-to-br grid place-items-center font-bold",
                                AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                              )}
                            >
                              {a.name.charAt(0)}
                            </div>
                          )}
                          <span className="absolute -bottom-1 -right-1 grid h-5 min-w-5 px-1 place-items-center rounded-full bg-fuchsia-500 text-[10px] font-bold">
                            {a.plays}
                          </span>
                        </div>
                        <p className="text-[11px] text-center truncate w-full">
                          {a.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recently played preview */}
              {recent.length > 0 && (
                <section>
                  <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-sm font-bold">Recently Played</h3>
                    <button
                      onClick={() => setTab("recent")}
                      className="text-[11px] text-fuchsia-300 hover:text-fuchsia-200"
                    >
                      See all
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {recent.slice(0, 4).map((s) => renderSongRow(s))}
                  </ul>
                </section>
              )}

              {/* Liked preview */}
              <section>
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-sm font-bold">Liked Songs</h3>
                  <button
                    onClick={() => setTab("liked")}
                    className="text-[11px] text-fuchsia-300 hover:text-fuchsia-200"
                  >
                    See all
                  </button>
                </div>
                {liked.length === 0 ? (
                  <p className="px-2 text-xs text-white/50">
                    Tap the heart on any song to save it here.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {liked.slice(0, 4).map((s) => renderSongRow(s, undefined, true))}
                  </ul>
                )}
              </section>

              {/* Device footer */}
              <div className="mx-2 mt-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-white/60">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-white/80">This device</span>
                </div>
                <p className="mt-1 truncate font-mono text-[10px] text-white/40">
                  {deviceId}
                </p>
              </div>
            </div>
          )}

          {tab === "liked" && (
            <div>
              {liked.length > 0 && (
                <div className="px-2 mb-3 flex items-center gap-3">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-rose-500" />
                    <Heart
                      className="absolute inset-0 m-auto h-7 w-7 text-white"
                      fill="currentColor"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold">Liked Songs</p>
                    <p className="text-[11px] text-white/55">
                      {liked.length} songs
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      playPlaylist(liked);
                      onOpenChange(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500 hover:bg-fuchsia-400 px-3.5 py-1.5 text-sm font-semibold"
                  >
                    <Play className="h-3.5 w-3.5" fill="currentColor" /> Play
                  </button>
                </div>
              )}
              {liked.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-white/55">
                  Tap the heart on any song to save it here.
                </p>
              ) : (
                <ul className="space-y-1">
                  {liked.map((s, i) => renderSongRow(s, i, true))}
                </ul>
              )}
            </div>
          )}

          {tab === "playlists" && !activePlaylist && (
            <ul className="space-y-1">
              {playlists.map((p) => (
                <li
                  key={p.id}
                  onClick={() => setActivePlaylistId(p.id)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] cursor-pointer"
                >
                  <img
                    src={p.cover}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-[11px] text-white/55 truncate">
                      {p.songIds.length} songs · {p.description}
                    </p>
                  </div>
                  <button
                    aria-label="Play playlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      playPlaylist(getPlaylistSongs(p));
                      onOpenChange(false);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full bg-fuchsia-500/30 hover:bg-fuchsia-500/50"
                  >
                    <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {tab === "playlists" && activePlaylist && (
            <div>
              <button
                onClick={() => setActivePlaylistId(null)}
                className="mx-2 mb-2 inline-flex items-center gap-1 text-xs text-white/70 hover:text-white"
              >
                <X className="h-3.5 w-3.5" /> Back
              </button>
              <div className="px-2 mb-3 flex items-center gap-3">
                <img
                  src={activePlaylist.cover}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold truncate">
                    {activePlaylist.name}
                  </p>
                  <p className="text-[11px] text-white/55 truncate">
                    {activeSongs.length} songs
                  </p>
                </div>
                <button
                  onClick={() => {
                    playPlaylist(activeSongs);
                    onOpenChange(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500 hover:bg-fuchsia-400 px-3.5 py-1.5 text-sm font-semibold"
                >
                  <Play className="h-3.5 w-3.5" fill="currentColor" /> Play
                </button>
              </div>
              <ul className="space-y-1">
                {activeSongs.map((s, i) => renderSongRow(s, i))}
              </ul>
            </div>
          )}

          {tab === "top" && (
            <div>
              {topPlayed.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-white/55">
                  Play a few songs to build your top chart.
                </p>
              ) : (
                <ul className="space-y-1">
                  {topPlayed.map((t, i) => {
                    const s = songById(t.id);
                    if (!s) return null;
                    return (
                      <li
                        key={t.id}
                        onClick={() => {
                          playSong(s);
                          onOpenChange(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] cursor-pointer"
                      >
                        <span
                          className={cn(
                            "w-6 text-center text-sm font-black tabular-nums shrink-0",
                            i === 0 && "text-amber-300",
                            i === 1 && "text-slate-200",
                            i === 2 && "text-orange-400",
                            i > 2 && "text-white/40"
                          )}
                        >
                          {i + 1}
                        </span>
                        <img
                          src={s.imageUrl}
                          alt=""
                          className="h-11 w-11 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <Marquee text={s.title} className="text-sm font-semibold" />
                          <p className="text-[11px] text-white/55 truncate">
                            {s.singer || s.artist}
                          </p>
                        </div>
                        <span className="text-[11px] text-fuchsia-300 font-bold shrink-0">
                          {t.count}×
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {tab === "recent" && (
            <div>
              {recent.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-white/55">
                  Nothing here yet. Hit play on something!
                </p>
              ) : (
                <ul className="space-y-1">
                  {recent.map((s, i) => renderSongRow(s, i))}
                </ul>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
