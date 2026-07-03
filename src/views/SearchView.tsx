import { useMemo, useState, useEffect, useRef } from "react";
import { Search, X, Play, Clock } from "lucide-react";
import { uniqueSongs } from "@/data/allSongs";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

/* Emoji-tagged genre browse tiles (Spotify-style colored cards). */
const GENRE_TILES: Array<{
  key: string;
  label: string;
  emoji: string;
  gradient: string;
  match: (s: any) => boolean;
}> = [
  {
    key: "telugu", label: "Telugu", emoji: "🎬",
    gradient: "from-fuchsia-600 to-pink-500",
    match: (s) => (s.language || "").toLowerCase() === "telugu",
  },
  {
    key: "hindi", label: "Hindi", emoji: "🎶",
    gradient: "from-amber-500 to-red-500",
    match: (s) => (s.language || "").toLowerCase() === "hindi",
  },
  {
    key: "tamil", label: "Tamil", emoji: "🥁",
    gradient: "from-emerald-500 to-teal-600",
    match: (s) => (s.language || "").toLowerCase() === "tamil",
  },
  {
    key: "english", label: "English", emoji: "🎤",
    gradient: "from-indigo-500 to-blue-600",
    match: (s) => (s.language || "").toLowerCase() === "english",
  },
  {
    key: "malayalam", label: "Malayalam", emoji: "🌴",
    gradient: "from-lime-500 to-emerald-600",
    match: (s) => (s.language || "").toLowerCase() === "malayalam",
  },
  {
    key: "mass", label: "Mass", emoji: "🔥",
    gradient: "from-orange-500 to-rose-600",
    match: (s) => (s.sync || s.genre || "").toLowerCase() === "mass",
  },
  {
    key: "romantic", label: "Romantic", emoji: "❤️",
    gradient: "from-rose-500 to-fuchsia-600",
    match: (s) => (s.sync || s.genre || "").toLowerCase() === "romantic",
  },
  {
    key: "rap", label: "Rap", emoji: "🎧",
    gradient: "from-slate-700 to-zinc-900",
    match: (s) => (s.sync || s.genre || "").toLowerCase() === "rap",
  },
  {
    key: "sad", label: "Chill / Sad", emoji: "🌙",
    gradient: "from-sky-600 to-indigo-800",
    match: (s) => (s.sync || "").toLowerCase() === "sad",
  },
  {
    key: "pop", label: "Pop", emoji: "🌟",
    gradient: "from-pink-500 to-purple-600",
    match: (s) => (s.genre || "").toLowerCase() === "pop",
  },
];

const RECENT_KEY = "search-recent-v1";
const loadRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveRecent = (list: string[]) =>
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));

export function SearchView({ onClose }: { onClose: () => void }) {
  const { playSong, currentSong, playPlaylist } = usePlayer();
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Don't auto-focus on mobile — it pops the keyboard and hides content.
    // Focus only on wider screens (tablet/desktop).
    if (window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current?.focus();
    }
    setRecent(loadRecent());
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pushRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8);
      saveRecent(next);
      return next;
    });
  };

  const base = uniqueSongs as any[];

  /* Top Artists (by song count) */
  const topArtists = useMemo(() => {
    const counts = new Map<string, { name: string; image: string; count: number }>();
    for (const s of base) {
      const name = (s.singer || s.artist || "").trim();
      if (!name || name === ".") continue;
      const cur = counts.get(name.toLowerCase());
      if (cur) cur.count++;
      else counts.set(name.toLowerCase(), { name, image: s.imageUrl, count: 1 });
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 10);
  }, []);

  /* Filtered by tapped genre tile (no query typed) */
  const genrePool = useMemo(() => {
    if (!genre) return [];
    const tile = GENRE_TILES.find((g) => g.key === genre);
    if (!tile) return [];
    return base.filter(tile.match).slice(0, 80);
  }, [genre]);

  /* Results grouping when user types */
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;

    const artistMap = new Map<string, { name: string; image: string; count: number }>();
    const albumMap = new Map<string, { name: string; image: string; artist: string }>();
    const songMatches: any[] = [];
    const genreMatches = GENRE_TILES.filter(
      (g) => g.label.toLowerCase().includes(term) || g.key.includes(term)
    );

    for (const s of base) {
      const title = s.title?.toLowerCase() || "";
      const artist = (s.singer || s.artist || "").toLowerCase();
      const album = (s.album || "").toLowerCase();

      const titleHit = title.includes(term);
      const artistHit = artist.includes(term);
      const albumHit = album.includes(term);

      if (titleHit || artistHit || albumHit) {
        songMatches.push(s);
      }
      if (artistHit) {
        const name = (s.singer || s.artist || "").trim();
        if (name && name !== ".") {
          const k = name.toLowerCase();
          const cur = artistMap.get(k);
          if (cur) cur.count++;
          else artistMap.set(k, { name, image: s.imageUrl, count: 1 });
        }
      }
      if (albumHit && s.album) {
        const k = s.album.toLowerCase();
        if (!albumMap.has(k))
          albumMap.set(k, { name: s.album, image: s.imageUrl, artist: s.singer || s.artist });
      }
    }

    // Best "top result" — prefer exact artist match, then song title match, then album.
    const topArtist = [...artistMap.values()].sort((a, b) => b.count - a.count)[0];
    let topResult:
      | { kind: "artist"; artist: { name: string; image: string; count: number } }
      | { kind: "song"; song: any }
      | { kind: "album"; album: { name: string; image: string; artist: string } }
      | null = null;
    if (topArtist && topArtist.name.toLowerCase() === term) {
      topResult = { kind: "artist", artist: topArtist };
    } else if (songMatches[0]) {
      topResult = { kind: "song", song: songMatches[0] };
    } else if (topArtist) {
      topResult = { kind: "artist", artist: topArtist };
    } else if (albumMap.size > 0) {
      topResult = { kind: "album", album: [...albumMap.values()][0] };
    }

    return {
      topResult,
      artists: [...artistMap.values()].sort((a, b) => b.count - a.count).slice(0, 8),
      genres: genreMatches,
      songs: songMatches.slice(0, 40),
      albums: [...albumMap.values()].slice(0, 12),
    };
  }, [q]);

  const playArtist = (name: string) => {
    inputRef.current?.blur();
    const list = base.filter(
      (s) => (s.singer || s.artist || "").toLowerCase() === name.toLowerCase()
    );
    if (list.length > 0) playPlaylist(list as any);
    pushRecent(name);
  };
  const playAlbum = (album: string) => {
    inputRef.current?.blur();
    const list = base.filter((s) => (s.album || "").toLowerCase() === album.toLowerCase());
    if (list.length > 0) playPlaylist(list as any);
    pushRecent(album);
  };
  const playSongItem = (s: any) => {
    inputRef.current?.blur();
    playSong(s);
    pushRecent(s.title);
  };

  const genreTile = genre ? GENRE_TILES.find((g) => g.key === genre) : null;

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto text-white animate-in fade-in duration-200"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -10%, #4a1f7a 0%, #2a0d4d 35%, #0a0418 75%)",
      }}
    >
      <div className="mx-auto max-w-[720px] px-5 pt-6 pb-40">
        {/* Header search bar */}
        <div className="flex items-center gap-3 sticky top-0 z-10 -mx-5 px-5 pt-2 pb-3 bg-gradient-to-b from-[#2a0d4d] to-transparent backdrop-blur-md">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur px-4 py-2.5">
            <Search className="h-4 w-4 text-white/70" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (e.target.value) setGenre(null);
              }}
              placeholder="Artists, songs, albums, genres…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/50"
            />
            {q && (
              <button
                aria-label="Clear"
                onClick={() => setQ("")}
                className="grid h-6 w-6 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/15 border border-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* --- WITH QUERY: grouped results --- */}
        {results && (
          <div className="mt-3 space-y-8">
            {/* Top Result */}
            {results.topResult && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3">
                  Top result
                </h3>
                {results.topResult.kind === "artist" && (
                  <button
                    onClick={() => playArtist(results.topResult!["artist"].name)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition group"
                  >
                    <img
                      src={results.topResult.artist.image}
                      className="h-20 w-20 rounded-full object-cover"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold truncate">
                        {results.topResult.artist.name}
                      </p>
                      <span className="mt-1 inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10">
                        🎤 Artist
                      </span>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-fuchsia-500 text-white opacity-0 group-hover:opacity-100 transition">
                      <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                    </span>
                  </button>
                )}
                {results.topResult.kind === "song" && (
                  <button
                    onClick={() => playSongItem(results.topResult!["song"])}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition group"
                  >
                    <img
                      src={results.topResult.song.imageUrl}
                      className="h-20 w-20 rounded-xl object-cover"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold truncate">{results.topResult.song.title}</p>
                      <p className="text-sm text-white/70 truncate">
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 mr-2">🎵 Song</span>
                        {results.topResult.song.singer || results.topResult.song.artist}
                      </p>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-fuchsia-500 text-white opacity-0 group-hover:opacity-100 transition">
                      <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                    </span>
                  </button>
                )}
                {results.topResult.kind === "album" && (
                  <button
                    onClick={() => playAlbum(results.topResult!["album"].name)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                  >
                    <img
                      src={results.topResult.album.image}
                      className="h-20 w-20 rounded-xl object-cover"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold truncate">
                        {results.topResult.album.name}
                      </p>
                      <p className="text-sm text-white/70 truncate">
                        💿 Album · {results.topResult.album.artist}
                      </p>
                    </div>
                  </button>
                )}
              </section>
            )}

            {/* Artists row */}
            {results.artists.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3">
                  🎤 Artists
                </h3>
                <div className="-mx-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-4 px-5 pb-2">
                    {results.artists.map((a) => (
                      <button
                        key={a.name}
                        onClick={() => playArtist(a.name)}
                        className="shrink-0 w-28 text-center"
                      >
                        <img
                          src={a.image}
                          className="h-24 w-24 rounded-full object-cover mx-auto border border-white/10"
                          alt=""
                        />
                        <p className="mt-2 text-sm font-semibold truncate">{a.name}</p>
                        <p className="text-[11px] text-white/50">{a.count} songs</p>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Genre matches */}
            {results.genres.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3">
                  🎨 Genres
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {results.genres.map((g) => (
                    <button
                      key={g.key}
                      onClick={() => {
                        setGenre(g.key);
                        setQ("");
                      }}
                      className={cn(
                        "h-20 rounded-2xl p-3 text-left font-bold text-lg bg-gradient-to-br shadow-md relative overflow-hidden",
                        g.gradient
                      )}
                    >
                      <span className="relative z-10">{g.label}</span>
                      <span className="absolute -bottom-2 -right-1 text-5xl rotate-12 opacity-90">
                        {g.emoji}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Songs list */}
            {results.songs.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3">
                  🎵 Songs
                </h3>
                <ul className="space-y-2">
                  {results.songs.map((s) => {
                    const playing = currentSong?.id === s.id;
                    return (
                      <li
                        key={s.id}
                        onClick={() => playSongItem(s)}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition",
                          playing
                            ? "bg-fuchsia-500/15 border border-fuchsia-400/30"
                            : "hover:bg-white/5 border border-transparent"
                        )}
                      >
                        <img src={s.imageUrl} className="h-12 w-12 rounded-xl object-cover" alt="" loading="lazy" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{s.title}</p>
                          <p className="text-xs text-white/60 truncate">
                            {s.singer || s.artist}
                            {s.album ? ` · ${s.album}` : ""}
                          </p>
                        </div>
                        <button
                          aria-label="Play"
                          className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"
                        >
                          <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {/* Albums grid */}
            {results.albums.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3">
                  💿 Albums
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {results.albums.map((a) => (
                    <button
                      key={a.name}
                      onClick={() => playAlbum(a.name)}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition"
                    >
                      <img src={a.image} className="w-full aspect-square rounded-xl object-cover" alt="" />
                      <p className="mt-2 text-sm font-semibold truncate">{a.name}</p>
                      <p className="text-xs text-white/60 truncate">{a.artist}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {results.songs.length === 0 && results.artists.length === 0 && (
              <p className="text-sm text-white/55 py-8 text-center">
                No matches for "{q}".
              </p>
            )}
          </div>
        )}

        {/* --- WITH TAPPED GENRE TILE (no query) --- */}
        {!results && genre && genreTile && (
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setGenre(null)}
                className="px-3 py-1.5 rounded-full bg-white/10 text-sm hover:bg-white/15"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold">
                {genreTile.emoji} {genreTile.label}
              </h2>
            </div>
            {genrePool.length > 0 && (
              <button
                onClick={() => playPlaylist(genrePool as any)}
                className="mb-4 inline-flex items-center gap-2 rounded-full bg-fuchsia-500 hover:bg-fuchsia-400 px-4 py-2 text-sm font-semibold"
              >
                <Play className="h-4 w-4" fill="currentColor" /> Play all
              </button>
            )}
            <ul className="space-y-2">
              {genrePool.map((s: any) => (
                <li
                  key={s.id}
                  onClick={() => playSongItem(s)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/5 cursor-pointer border border-transparent"
                >
                  <img src={s.imageUrl} className="h-12 w-12 rounded-xl object-cover" alt="" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.title}</p>
                    <p className="text-xs text-white/60 truncate">{s.singer || s.artist}</p>
                  </div>
                </li>
              ))}
              {genrePool.length === 0 && (
                <p className="text-sm text-white/55 text-center py-6">Nothing in this genre yet.</p>
              )}
            </ul>
          </div>
        )}

        {/* --- EMPTY STATE: recents + top artists + genre tiles --- */}
        {!results && !genre && (
          <div className="mt-4 space-y-9">
            {recent.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase tracking-widest text-white/50">
                    <Clock className="inline h-3 w-3 mr-1 -mt-0.5" /> Recent searches
                  </h3>
                  <button
                    onClick={() => {
                      setRecent([]);
                      localStorage.removeItem(RECENT_KEY);
                    }}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQ(r)}
                      className="px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 text-sm"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3">
                🎤 Top Artists
              </h3>
              <div className="-mx-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-4 px-5 pb-2">
                  {topArtists.map((a) => (
                    <button
                      key={a.name}
                      onClick={() => playArtist(a.name)}
                      className="shrink-0 w-24 text-center"
                    >
                      <img
                        src={a.image}
                        className="h-24 w-24 rounded-full object-cover mx-auto border border-white/10"
                        alt=""
                      />
                      <p className="mt-2 text-xs font-semibold truncate">{a.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3">
                🎨 Browse by Genre
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {GENRE_TILES.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setGenre(g.key)}
                    className={cn(
                      "h-24 rounded-2xl p-3 text-left font-bold text-lg bg-gradient-to-br shadow-md relative overflow-hidden",
                      g.gradient
                    )}
                  >
                    <span className="relative z-10">{g.label}</span>
                    <span className="absolute -bottom-3 -right-1 text-6xl rotate-12 opacity-90 select-none">
                      {g.emoji}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
