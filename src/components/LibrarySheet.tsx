import { useMemo, useState } from "react";
import { Heart, ListMusic, Play, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePlayer } from "@/context/PlayerContext";
import { uniqueSongs } from "@/data/allSongs";
import { playlists, getPlaylistSongs } from "@/data/playlists";
import { cn } from "@/lib/utils";
import type { Song } from "@/data/Song";

type Tab = "liked" | "playlists";

export function LibrarySheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { likedSongs, playSong, playPlaylist, toggleLike } = usePlayer();
  const [tab, setTab] = useState<Tab>("liked");
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  const liked = useMemo<Song[]>(() => {
    const set = new Set(likedSongs);
    return uniqueSongs.filter((s) => set.has(s.id));
  }, [likedSongs]);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
  const activeSongs = activePlaylist ? getPlaylistSongs(activePlaylist) : [];

  const renderSongRow = (song: Song, showHeart = false) => (
    <li
      key={song.id}
      onClick={() => {
        playSong(song);
        onOpenChange(false);
      }}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer"
    >
      <img src={song.imageUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{song.title}</p>
        <p className="text-xs text-white/55 truncate">
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
        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
      >
        <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
      </button>
    </li>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[#120726] border-l border-white/10 text-white p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="text-white text-xl">Your Library</SheetTitle>
        </SheetHeader>

        {/* Tabs */}
        <div className="px-5 flex gap-2">
          {([
            { id: "liked", label: "Liked", icon: Heart },
            { id: "playlists", label: "Playlists", icon: ListMusic },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setActivePlaylistId(null);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium border transition",
                tab === id
                  ? "bg-fuchsia-500/25 border-fuchsia-400/50 text-white"
                  : "border-white/10 text-white/70 hover:bg-white/5"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-8 pt-3">
          {tab === "liked" && (
            liked.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-white/55">
                Tap the heart on any song to save it here.
              </p>
            ) : (
              <ul className="space-y-1">{liked.map((s) => renderSongRow(s, true))}</ul>
            )
          )}

          {tab === "playlists" && !activePlaylist && (
            <ul className="space-y-1">
              {playlists.map((p) => (
                <li
                  key={p.id}
                  onClick={() => setActivePlaylistId(p.id)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer"
                >
                  <img src={p.cover} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-white/55 truncate">
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
                className="mx-3 mb-2 inline-flex items-center gap-1 text-xs text-white/70 hover:text-white"
              >
                <X className="h-3.5 w-3.5" /> Back to playlists
              </button>
              <div className="px-3 mb-3 flex items-center gap-3">
                <img
                  src={activePlaylist.cover}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold truncate">{activePlaylist.name}</p>
                  <p className="text-xs text-white/55 truncate">
                    {activeSongs.length} songs
                  </p>
                </div>
                <button
                  onClick={() => {
                    playPlaylist(activeSongs);
                    onOpenChange(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500 hover:bg-fuchsia-600 px-3.5 py-1.5 text-sm font-semibold"
                >
                  <Play className="h-3.5 w-3.5" fill="currentColor" /> Play
                </button>
              </div>
              <ul className="space-y-1">{activeSongs.map((s) => renderSongRow(s))}</ul>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
