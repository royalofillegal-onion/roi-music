import { useEffect, useMemo, useState } from "react";
import { uniqueSongs, getLivePopularSongs } from "@/data/allSongs";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Search, X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Song } from "@/data/Song";

type Tab = "lists" | "songs" | "artists" | "albums";
const TABS: Tab[] = ["lists", "songs", "artists", "albums"];

export function HomeView() {
  const { playSong, currentSong } = usePlayer();
  const [tab, setTab] = useState<Tab>("songs");
  const [searchOpen, setSearchOpen] = useState(false);
  const [detail, setDetail] = useState<
    | { kind: "artist" | "album"; name: string }
    | null
  >(null);

  const popular = useMemo(() => getLivePopularSongs(30), []);

  const artists = useMemo(() => {
    const map = new Map<string, { sample: Song; count: number }>();
    for (const s of uniqueSongs) {
      const key = (s.singer || s.artist || "").trim();
      if (!key) continue;
      const prev = map.get(key);
      if (prev) prev.count++;
      else map.set(key, { sample: s, count: 1 });
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const albums = useMemo(() => {
    const map = new Map<string, { sample: Song; count: number; artist: string }>();
    for (const s of uniqueSongs) {
      const key = (s.album || s.movie || "").trim();
      if (!key) continue;
      const prev = map.get(key);
      if (prev) prev.count++;
      else map.set(key, { sample: s, count: 1, artist: s.singer || s.artist });
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div className="mx-auto max-w-[560px] px-6 pt-8 pb-40">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="font-caveat text-white/50 text-2xl leading-none">welcome to</p>
          <h1 className="font-caveat text-6xl leading-tight tracking-tight">ROI Music</h1>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="mt-3 grid h-11 w-11 place-items-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <Search className="h-5 w-5" />
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex items-center gap-6 mb-6 border-b border-white/10 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "font-caveat text-2xl capitalize pb-2 -mb-px transition relative shrink-0",
              tab === t ? "text-white" : "text-white/40 hover:text-white/70"
            )}
          >
            {t}
            {tab === t && (
              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-white rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      {tab === "lists" && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-caveat text-3xl">popular now</h2>
            <span className="text-xs text-white/40">{popular.length} tracks</span>
          </div>
          <SongList songs={popular} onPlay={playSong} currentId={currentSong?.id} />
        </section>
      )}

      {tab === "songs" && (
        <SongList
          songs={uniqueSongs.slice(0, 120)}
          onPlay={playSong}
          currentId={currentSong?.id}
        />
      )}

      {tab === "artists" && (
        <ul className="space-y-2">
          {artists.slice(0, 60).map(({ name, sample, count }) => (
            <li key={name}>
              <button
                onClick={() => setDetail({ kind: "artist", name })}
                className="w-full flex items-center gap-4 rounded-2xl p-2 hover:bg-white/5 transition text-left group"
              >
                <img
                  src={sample.imageUrl}
                  alt={name}
                  className="h-16 w-16 rounded-full object-cover border border-white/10"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-caveat text-2xl leading-tight truncate">{name}</p>
                  <p className="text-xs text-white/50">{count} song{count !== 1 ? "s" : ""}</p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 group-hover:bg-white/20">
                  <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {tab === "albums" && (
        <ul className="grid grid-cols-2 gap-4">
          {albums.slice(0, 60).map(({ name, sample, count, artist }) => (
            <li key={name}>
              <button
                onClick={() => setDetail({ kind: "album", name })}
                className="w-full text-left group"
              >
                <div className="aspect-square rounded-2xl overflow-hidden border border-white/10">
                  <img
                    src={sample.imageUrl}
                    alt={name}
                    className="h-full w-full object-cover group-hover:scale-105 transition"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 font-caveat text-xl truncate">{name}</p>
                <p className="text-xs text-white/50 truncate">
                  {artist} · {count} track{count !== 1 ? "s" : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onPlay={playSong} />}
      {detail && (
        <DetailView
          kind={detail.kind}
          name={detail.name}
          onClose={() => setDetail(null)}
          onPlay={playSong}
          currentId={currentSong?.id}
        />
      )}
    </div>
  );
}

/* ---------- Shared song list ---------- */

function SongList({
  songs,
  onPlay,
  currentId,
}: {
  songs: Song[];
  onPlay: (s: Song) => void;
  currentId?: string;
}) {
  return (
    <ul className="space-y-1">
      {songs.map((s, idx) => {
        const active = currentId === s.id;
        return (
          <li key={s.id}>
            <button
              onClick={() => onPlay(s)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl p-2 transition text-left group",
                active ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <span className="w-6 text-center text-sm text-white/40 font-caveat text-lg">
                {idx + 1}
              </span>
              <img
                src={s.imageUrl}
                alt=""
                className="h-14 w-14 rounded-lg object-cover"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="font-caveat text-2xl leading-tight truncate">{s.title}</p>
                <p className="text-xs text-white/50 truncate">
                  {s.singer || s.artist}
                  {s.album ? ` · ${s.album}` : ""}
                </p>
              </div>
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full shrink-0 transition",
                  active
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/80 group-hover:bg-white/20"
                )}
              >
                <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Search overlay ---------- */

function SearchOverlay({
  onClose,
  onPlay,
}: {
  onClose: () => void;
  onPlay: (s: Song) => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return uniqueSongs
      .filter((s) => {
        return (
          s.title.toLowerCase().includes(term) ||
          (s.singer || s.artist || "").toLowerCase().includes(term) ||
          (s.album || "").toLowerCase().includes(term)
        );
      })
      .slice(0, 40);
  }, [q]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white animate-in fade-in duration-200">
      <div className="mx-auto max-w-[560px] px-6 pt-6 pb-32">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Close search"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5">
            <Search className="h-4 w-4 text-white/50" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="songs, artists, albums…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40"
            />
          </div>
        </div>

        <div className="mt-6">
          {q.trim() === "" ? (
            <p className="font-caveat text-2xl text-white/50 text-center mt-16">
              start typing to search
            </p>
          ) : results.length === 0 ? (
            <p className="font-caveat text-2xl text-white/50 text-center mt-16">
              no matches
            </p>
          ) : (
            <SongList
              songs={results}
              onPlay={(s) => {
                onPlay(s);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Artist / Album detail ---------- */

function DetailView({
  kind,
  name,
  onClose,
  onPlay,
  currentId,
}: {
  kind: "artist" | "album";
  name: string;
  onClose: () => void;
  onPlay: (s: Song) => void;
  currentId?: string;
}) {
  const songs = useMemo(() => {
    return uniqueSongs.filter((s) => {
      if (kind === "artist") return (s.singer || s.artist) === name;
      return (s.album || s.movie) === name;
    });
  }, [kind, name]);

  const cover = songs[0]?.imageUrl;
  const subtitle =
    kind === "album"
      ? songs[0]?.singer || songs[0]?.artist || "Album"
      : `${songs.length} song${songs.length !== 1 ? "s" : ""}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 bg-black text-white overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="mx-auto max-w-[560px] px-6 pt-6 pb-40">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-white/70 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="font-caveat text-xl">back</span>
        </button>

        <div className="mt-6 flex items-end gap-4">
          {cover && (
            <img
              src={cover}
              alt={name}
              className={cn(
                "h-32 w-32 object-cover border border-white/10",
                kind === "artist" ? "rounded-full" : "rounded-2xl"
              )}
            />
          )}
          <div className="min-w-0 pb-2">
            <p className="text-xs uppercase tracking-widest text-white/40">{kind}</p>
            <h2 className="font-caveat text-4xl leading-tight truncate">{name}</h2>
            <p className="text-sm text-white/60 truncate">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => songs[0] && onPlay(songs[0])}
          className="mt-6 flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 font-caveat text-xl hover:scale-105 transition"
        >
          <Play className="h-4 w-4 ml-0.5" fill="currentColor" /> play all
        </button>

        <div className="mt-6">
          <SongList songs={songs} onPlay={onPlay} currentId={currentId} />
        </div>
      </div>
    </div>
  );
}
