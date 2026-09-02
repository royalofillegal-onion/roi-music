import { useMemo, useState } from "react";
import { Play, Heart, Clock, Sparkles, ListMusic, Share2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePlayer } from "@/context/PlayerContext";
import { uniqueSongs } from "@/data/allSongs";
import { shuffle } from "@/lib/recos";
import { usePlaylists, type StoredPlaylist } from "@/lib/playlistStore";
import { cn } from "@/lib/utils";
import type { Song } from "@/data/Song";

type Tab = "liked" | "recent" | "mixes" | "playlists";

export function LibraryView() {
  const { likedSongs, recentlyPlayed, playPlaylist, playSong, currentSong, toggleLike, isLiked } =
    usePlayer();
  const [tab, setTab] = useState<Tab>("liked");
  const {
    playlists,
    isPlaylistLiked,
    togglePlaylistLike,
    savePlaylist,
    deletePlaylist,
    buildShareLink,
    resolve,
  } = usePlaylists();

  const liked = useMemo(
    () => (uniqueSongs as Song[]).filter((s) => (likedSongs as any)?.includes?.(s.id) || isLiked(s.id)),
    [likedSongs]
  );

  const mixes = useMemo(
    () => {
      const byLang: Record<string, Song[]> = {};
      (uniqueSongs as Song[]).forEach((s) => {
        const k = s.language || s.genre || "Mix";
        (byLang[k] ||= []).push(s);
      });
      return Object.entries(byLang)
        .filter(([, v]) => v.length > 4)
        .slice(0, 8)
        .map(([name, v]) => ({ name, songs: shuffle(v).slice(0, 25) }));
    },
    []
  );

  const sharePlaylist = async (p: StoredPlaylist) => {
    const url = buildShareLink(p);
    try {
      if (navigator.share) await navigator.share({ title: p.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied");
      }
    } catch {
      /* dismissed */
    }
  };

  const saveMix = (name: string, songs: Song[]) => {
    savePlaylist(name, songs.map((s) => s.id));
    toast.success(`Saved "${name}" to your playlists`);
    setTab("playlists");
  };

  const list: Song[] = tab === "liked" ? liked : (recentlyPlayed as Song[]);


  return (
    <main className="min-h-dvh bg-black px-5 pt-12 pb-44">
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        Your Library
      </h1>

      <div className="mt-4 flex gap-2">
        {([
          ["liked", "Liked", Heart],
          ["playlists", "Playlists", ListMusic],
          ["recent", "Recent", Clock],
          ["mixes", "Mixes", Sparkles],
        ] as const).map(([k, label, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              tab === k
                ? "border-red-700/70 bg-red-950/50 text-red-400"
                : "border-white/10 bg-white/5 text-zinc-400"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "playlists" ? (
        <div className="mt-6 space-y-3">
          <button
            disabled={liked.length === 0}
            onClick={() => saveMix(`Liked mix · ${new Date().toLocaleDateString()}`, liked)}
            className="inline-flex items-center gap-2 rounded-full bg-red-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> New from liked
          </button>

          {playlists.length === 0 && (
            <p className="pt-8 text-center text-sm text-zinc-600">
              No playlists yet. Save a mix or open a shared link.
            </p>
          )}

          {playlists.map((p) => {
            const songs = resolve(p);
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-zinc-900/70 p-3"
              >
                <img
                  src={songs[0]?.imageUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    {songs.length} songs{p.imported ? " · shared" : ""}
                  </p>
                </div>
                <button
                  onClick={() => togglePlaylistLike(p.id)}
                  aria-label="Like playlist"
                  className="grid h-9 w-9 place-items-center rounded-full"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isPlaylistLiked(p.id) ? "fill-red-600 text-red-600" : "text-zinc-500"
                    )}
                  />
                </button>
                <button onClick={() => sharePlaylist(p)} aria-label="Share playlist" className="grid h-9 w-9 place-items-center rounded-full">
                  <Share2 className="h-4 w-4 text-zinc-400" />
                </button>
                <button onClick={() => deletePlaylist(p.id)} aria-label="Delete playlist" className="grid h-9 w-9 place-items-center rounded-full">
                  <Trash2 className="h-4 w-4 text-zinc-600" />
                </button>
                <button
                  disabled={songs.length === 0}
                  onClick={() => playPlaylist(songs)}
                  aria-label="Play playlist"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black disabled:opacity-40"
                >
                  <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                </button>
              </div>
            );
          })}
        </div>
      ) : tab === "mixes" ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {mixes.map((m) => (
            <div
              key={m.name}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-zinc-900 p-4 text-left"
            >
              <img
                src={m.songs[0]?.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-35 transition group-hover:opacity-50"
              />
              <button onClick={() => playPlaylist(m.songs)} className="relative block w-full text-left">
                <p className="text-[10px] uppercase tracking-[0.2em] text-red-500">Mix</p>
                <p className="mt-6 text-base font-bold text-white">{m.name}</p>
                <p className="text-[11px] text-zinc-400">{m.songs.length} songs</p>
              </button>
              <button
                onClick={() => saveMix(m.name, m.songs)}
                className="relative mt-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
              >
                <Plus className="h-3 w-3" /> Save
              </button>
            </div>
          ))}
        </div>
      ) : (

        <>
          {list.length > 0 && (
            <button
              onClick={() => playPlaylist(list)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-black"
            >
              <Play className="h-4 w-4" fill="currentColor" /> Play all
            </button>
          )}
          <ul className="mt-4 space-y-1.5">
            {list.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => playSong(s)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/5",
                    currentSong?.id === s.id && "bg-white/5"
                  )}
                >
                  <img src={s.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm font-semibold",
                        currentSong?.id === s.id ? "text-red-500" : "text-zinc-100"
                      )}
                    >
                      {s.title}
                    </span>
                    <span className="block truncate text-xs text-zinc-500">
                      {(s as any).singer || s.artist}
                    </span>
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(s.id);
                    }}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        isLiked(s.id) ? "fill-red-600 text-red-600" : "text-zinc-500"
                      )}
                    />
                  </span>
                </button>
              </li>
            ))}
            {list.length === 0 && (
              <p className="mt-10 text-center text-sm text-zinc-600">
                {tab === "liked" ? "No liked songs yet." : "Nothing played yet."}
              </p>
            )}
          </ul>
        </>
      )}
    </main>
  );
}
