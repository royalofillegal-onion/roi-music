import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Play, Pause, Share2, ListPlus, Music4, Volume2 } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { popularSongs, uniqueSongs } from "@/data/allSongs";
import { cn } from "@/lib/utils";
import type { Song } from "@/data/Song";

const PAGE = 12;

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483647;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Instagram-Reels style vertical music discovery feed.
 * Infinite: new panels are appended as the user approaches the end,
 * so scrolling never reaches a bottom.
 */
export function DiscoverFeed({ onExpand }: { onExpand: () => void }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlayPause,
    toggleLike,
    isLiked,
    addToQueue,
  } = usePlayer();

  const pool = useMemo<Song[]>(
    () => (popularSongs.length > 20 ? popularSongs : (uniqueSongs as Song[])),
    []
  );
  const [pages, setPages] = useState(1);
  const feed = useMemo<Song[]>(() => {
    const out: Song[] = [];
    for (let p = 0; p < pages; p++) {
      const chunk = shuffle(pool, p + 7).slice(0, PAGE);
      out.push(...chunk);
    }
    return out;
  }, [pages, pool]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Track which panel is centered.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) setActiveIdx(idx);
          }
        });
      },
      { root, threshold: [0.6] }
    );
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [feed.length]);

  // Endless feed: append another page when close to the end.
  useEffect(() => {
    if (activeIdx >= feed.length - 4) setPages((p) => p + 1);
  }, [activeIdx, feed.length]);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight * 2.5 >= el.scrollHeight) {
      setPages((p) => p + 1);
    }
  }, []);

  // Once the user has started playback, swiping changes the track (Reels behaviour).
  useEffect(() => {
    if (!started) return;
    const song = feed[activeIdx];
    if (song && song.id !== currentSong?.id) playSong(song);
  }, [activeIdx, started]);


  return (
    <div
      ref={containerRef}
      className="h-dvh snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {feed.map((song, i) => {
        const active = i === activeIdx;
        const playingThis = currentSong?.id === song.id && isPlaying;
        const liked = isLiked(song.id);
        const videoUrl = (song as any).videoUrl as string | undefined;

        return (
          <section
            key={song.id}
            data-idx={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className="relative flex h-dvh snap-start snap-always items-center justify-center overflow-hidden bg-black"
          >
            {/* Ambient blurred backdrop */}
            <img
              src={song.imageUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-125 object-cover opacity-40 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black" />

            {/* Media */}
            <div className="relative z-10 w-full px-6">
              <button
                onClick={() => {
                  setStarted(true);
                  if (currentSong?.id === song.id) togglePlayPause();
                  else playSong(song);
                }}
                className="group relative mx-auto block w-full max-w-[380px] overflow-hidden rounded-[32px] border border-white/10 shadow-[0_40px_120px_-30px_rgba(220,38,38,0.55)]"
              >
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    muted
                    loop
                    playsInline
                    autoPlay={active}
                    className="aspect-[9/12] w-full object-cover"
                  />
                ) : (
                  <div className="relative aspect-square w-full overflow-hidden">
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className={cn(
                        "h-full w-full object-cover transition-transform duration-[9000ms] ease-out",
                        active && playingThis ? "scale-110" : "scale-100"
                      )}
                    />
                    {/* animated visualiser rings when no video */}
                    {playingThis && (
                      <>
                        <span className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.45),transparent_60%)]" />
                        <span className="pointer-events-none absolute bottom-4 left-4 flex items-end gap-1">
                          {[0, 1, 2, 3, 4].map((b) => (
                            <span
                              key={b}
                              className="w-1 rounded-full bg-red-500/90"
                              style={{
                                height: 8 + ((b * 7) % 20),
                                animation: `pulse 1.${b + 1}s ease-in-out infinite`,
                              }}
                            />
                          ))}
                        </span>
                      </>
                    )}
                  </div>
                )}

                <span
                  className={cn(
                    "absolute inset-0 grid place-items-center transition",
                    playingThis ? "opacity-0" : "opacity-100"
                  )}
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-black shadow-2xl">
                    {playingThis ? (
                      <Pause className="h-6 w-6" fill="currentColor" />
                    ) : (
                      <Play className="ml-1 h-6 w-6" fill="currentColor" />
                    )}
                  </span>
                </span>
              </button>

              {/* Caption */}
              <div className="mx-auto mt-5 flex max-w-[380px] items-end justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-white">{song.title}</h2>
                  <p className="truncate text-sm text-zinc-400">
                    {(song as any).singer || song.artist}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    <Music4 className="h-3 w-3" />
                    {song.genre || song.language || "Music"}
                  </p>
                </div>

                {/* Action rail */}
                <div className="flex shrink-0 flex-col items-center gap-4">
                  <button
                    onClick={() => toggleLike(song.id)}
                    aria-label="Like"
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur transition active:scale-90"
                  >
                    <Heart
                      className={cn("h-5 w-5", liked ? "fill-red-600 text-red-600" : "text-white")}
                    />
                  </button>
                  <button
                    onClick={() => addToQueue(song)}
                    aria-label="Add to queue"
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur transition active:scale-90"
                  >
                    <ListPlus className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={() =>
                      navigator.share?.({ title: song.title, url: location.href }).catch(() => {})
                    }
                    aria-label="Share"
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur transition active:scale-90"
                  >
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={onExpand}
                    aria-label="Open player"
                    className="grid h-11 w-11 place-items-center rounded-full border border-red-800/60 bg-red-950/50 backdrop-blur transition active:scale-90"
                  >
                    <Volume2 className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* swipe hint */}
            {i === 0 && (
              <p className="absolute bottom-28 left-0 right-0 z-10 text-center text-[10px] uppercase tracking-[0.3em] text-zinc-600">
                Swipe up for more
              </p>
            )}
          </section>
        );
      })}

      {/* Recommendations panel at the end of the feed */}
      <section className="min-h-dvh snap-start bg-black pt-8 pb-44">
        <h2 className="px-5 text-lg font-bold text-white">Made for you</h2>
        {rails.map((r) => (
          <SongRail key={r.id} title={r.title} subtitle={r.subtitle} songs={r.songs} layout={r.layout} />
        ))}
      </section>
    </div>
  );
}
