import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Search, X,
  ListMusic, Volume2, VolumeX, MicVocal, Heart, Clock,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { uniqueSongs } from "@/data/allSongs";
import type { Song } from "@/data/Song";
import { similarTo, forYou } from "@/lib/recos";
import { getLyricsForSong } from "@/data/lyrics";

const RECENT_KEY = "roi.recentSearches.v1";
const fmt = (t: number) =>
  !isFinite(t) || t < 0 ? "0:00" : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const norm = (v?: string | number) => String(v ?? "").toLowerCase();
const who = (s: Song) => s.singer || s.artist;

export function PlayerScreen() {
  const p = usePlayer();
  const { currentSong, isPlaying, currentTime, duration, volume, isShuffled, isRepeating, circularQueue } = p;

  // Before the user interacts nothing plays; show a sensible first song.
  const fallback = useMemo(() => forYou(1).songs[0] ?? uniqueSongs[0], []);
  const song = currentSong ?? fallback;

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
  });
  const [queueOpen, setQueueOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [lastVol, setLastVol] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = norm(query).trim();
    if (!q) return [];
    return uniqueSongs
      .filter((s) =>
        [s.title, s.artist, s.singer, s.album, s.movie, s.genre, s.language].some((f) => norm(f).includes(q)))
      .slice(0, 30);
  }, [query]);

  // Keep a smart queue topped up so playback never runs dry.
  useEffect(() => {
    if (!currentSong || circularQueue.length >= 4) return;
    const have = new Set([currentSong.id, ...circularQueue.map((s) => s.id)]);
    const picks = [...similarTo(currentSong, 8), ...forYou(8).songs].filter((s) => !have.has(s.id));
    picks.slice(0, 8).forEach((s) => { have.add(s.id); p.addToQueue(s); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id, circularQueue.length]);

  // Rebuild "up next" around a freshly searched song.
  const playFromSearch = (s: Song) => {
    p.clearQueue();
    p.playSong(s);
    const next = [s.title, ...recent.filter((r) => r !== s.title)].slice(0, 6);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    closeSearch();
  };

  const playNext = (s: Song) => {
    const rest = circularQueue.filter((q) => q.id !== s.id);
    p.clearQueue();
    [s, ...rest].forEach((x) => p.addToQueue(x));
  };

  const pickFromQueue = (s: Song) => {
    const idx = circularQueue.findIndex((q) => q.id === s.id);
    const rest = circularQueue.slice(idx + 1);
    p.clearQueue();
    rest.forEach((x) => p.addToQueue(x));
    p.playSong(s);
    setQueueOpen(false);
  };

  const closeSearch = () => { setSearchOpen(false); setQuery(""); inputRef.current?.blur(); };

  const togglePlay = () => (currentSong ? p.togglePlayPause() : p.playSong(song));

  // Keyboard: Space play/pause, arrows seek/skip, / focuses search, Esc closes overlays.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === "INPUT";
      if (e.key === "Escape") { closeSearch(); setQueueOpen(false); setLyricsOpen(false); return; }
      if (typing) return;
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
      else if (e.key === "/") { e.preventDefault(); inputRef.current?.focus(); }
      else if (e.key === "ArrowRight" && e.shiftKey) p.nextSong();
      else if (e.key === "ArrowLeft" && e.shiftKey) p.previousSong();
      else if (e.key === "ArrowRight") p.seek(Math.min(duration, currentTime + 5));
      else if (e.key === "ArrowLeft") p.seek(Math.max(0, currentTime - 5));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Click outside closes the search overlay (music keeps playing).
  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!searchBoxRef.current?.contains(e.target as Node)) closeSearch();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [searchOpen]);

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter" && results[active]) playFromSearch(results[active]);
  };

  const lyrics = getLyricsForSong(song?.id);
  const pct = duration ? (currentTime / duration) * 100 : 0;
  const liked = song ? p.isLiked(song.id) : false;

  if (!song) return null;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background text-foreground">
      {/* Artwork-inspired background */}
      <div
        key={song.id}
        className="absolute inset-0 scale-125 bg-cover bg-center opacity-60 blur-3xl transition-opacity duration-700 animate-in fade-in"
        style={{ backgroundImage: `url(${song.imageUrl})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" aria-hidden />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col px-4 pb-6 pt-4 sm:px-8">
        {/* Top: logo + search */}
        <header className="flex items-center gap-3">
          <span className="shrink-0 font-display text-sm font-black tracking-[0.25em] text-primary">ROI</span>
          <div ref={searchBoxRef} className="relative mx-auto w-full max-w-xl">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-2.5 backdrop-blur-xl focus-within:border-primary/70">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={onSearchKey}
                placeholder="Search songs, artists, albums, genres…"
                aria-label="Search songs"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {searchOpen && (
              <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-[60dvh] overflow-y-auto rounded-2xl border border-border/60 bg-card/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                {!query && (
                  recent.length ? (
                    <div className="p-2">
                      <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Recent searches</p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button key={r} onClick={() => { setQuery(r); inputRef.current?.focus(); }}
                            className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs hover:bg-muted/70">
                            <Clock className="h-3 w-3" /> {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : <p className="p-4 text-center text-sm text-muted-foreground">Type to search the whole catalogue</p>
                )}
                {query && !results.length && (
                  <p className="p-6 text-center text-sm text-muted-foreground">No songs found</p>
                )}
                {results.map((s, i) => (
                  <div key={s.id}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 rounded-xl p-2 ${i === active ? "bg-muted" : ""}`}>
                    <button onClick={() => playFromSearch(s)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <img src={s.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover" loading="lazy" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{s.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{who(s)}</span>
                      </span>
                    </button>
                    <button onClick={() => { playNext(s); closeSearch(); }}
                      className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                      Play next
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Center: artwork or lyrics */}
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 py-4">
          {lyricsOpen && lyrics ? (
            <div className="w-full max-w-lg flex-1 overflow-y-auto whitespace-pre-line text-center text-lg leading-relaxed text-foreground/90 animate-in fade-in">
              {lyrics}
            </div>
          ) : (
            <img
              key={song.id}
              src={song.imageUrl}
              alt={`${song.title} artwork`}
              className={`aspect-square max-h-full w-[min(78vw,46dvh)] rounded-3xl object-cover shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.55)] transition-transform duration-500 animate-in fade-in zoom-in-95 ${isPlaying ? "scale-100" : "scale-95"}`}
            />
          )}
          <div className="flex w-full max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1 text-center">
              <h1 className="truncate text-2xl font-bold sm:text-3xl">{song.title}</h1>
              <p className="truncate text-sm text-muted-foreground sm:text-base">{who(song)}</p>
            </div>
          </div>
        </section>

        {/* Bottom: progress + controls */}
        <footer className="mx-auto w-full max-w-lg">
          <input
            type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
            onChange={(e) => p.seek(Number(e.target.value))}
            aria-label="Seek"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-primary"
            style={{ background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)` }}
          />
          <div className="mt-1 flex justify-between text-xs tabular-nums text-muted-foreground">
            <span>{fmt(currentTime)}</span><span>{fmt(duration || song.duration)}</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button onClick={p.toggleShuffle} aria-label="Shuffle" aria-pressed={isShuffled}
              className={`p-2 ${isShuffled ? "text-primary" : "text-muted-foreground"}`}>
              <Shuffle className="h-5 w-5" />
            </button>
            <button onClick={p.previousSong} aria-label="Previous" className="p-2"><SkipBack className="h-7 w-7 fill-current" /></button>
            <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95">
              {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="ml-1 h-7 w-7 fill-current" />}
            </button>
            <button onClick={p.nextSong} aria-label="Next" className="p-2"><SkipForward className="h-7 w-7 fill-current" /></button>
            <button onClick={p.toggleRepeat} aria-label={isRepeating ? "Repeat one" : "Repeat all"}
              title={isRepeating ? "Repeat one" : "Repeat all"}
              className={`p-2 ${isRepeating ? "text-primary" : "text-muted-foreground"}`}>
              {isRepeating ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            <button onClick={() => p.toggleLike(song.id)} aria-label="Like" className={liked ? "text-primary" : ""}>
              <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => { if (volume > 0) { setLastVol(volume); p.setVolume(0); } else p.setVolume(lastVol || 1); }}
              aria-label="Mute">
              {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input type="range" min={0} max={1} step={0.01} value={volume}
              onChange={(e) => p.setVolume(Number(e.target.value))}
              aria-label="Volume" className="h-1 w-24 accent-primary sm:w-32" />
            <div className="flex-1" />
            <button onClick={() => setLyricsOpen((v) => !v)} disabled={!lyrics} aria-label="Lyrics"
              className={`disabled:opacity-30 ${lyricsOpen ? "text-primary" : ""}`}>
              <MicVocal className="h-5 w-5" />
            </button>
            <button onClick={() => setQueueOpen(true)} aria-label="Up next"><ListMusic className="h-5 w-5" /></button>
          </div>
        </footer>
      </div>

      {/* Queue overlay */}
      {queueOpen && (
        <div className="absolute inset-0 z-40 flex items-end justify-center bg-background/60 backdrop-blur-sm sm:items-center"
          onClick={() => setQueueOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}
            className="max-h-[70dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border/60 bg-card p-4 sm:rounded-3xl animate-in slide-in-from-bottom-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Up next</h2>
              <button onClick={() => setQueueOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            {!circularQueue.length && <p className="py-6 text-center text-sm text-muted-foreground">Press play to build your queue</p>}
            {circularQueue.map((s) => (
              <button key={s.id} onClick={() => pickFromQueue(s)}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-muted">
                <img src={s.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" loading="lazy" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{s.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{who(s)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
