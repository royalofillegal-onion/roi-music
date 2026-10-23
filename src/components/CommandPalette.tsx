import { useEffect, useMemo, useState } from "react";
import {
  Command as CommandIcon,
  Home,
  Search as SearchIcon,
  Library,
  Clapperboard,
  User,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Radio,
  Shuffle,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { usePlayer } from "@/context/PlayerContext";
import { uniqueSongs } from "@/data/allSongs";
import { buildRadio } from "@/lib/radio";
import type { Song } from "@/data/Song";
import type { TabKey } from "@/components/BottomNav";

/**
 * Keyboard-first command bar: Cmd/Ctrl+K anywhere, or the floating button.
 * Also wires global playback shortcuts for desktop listeners.
 */
export function CommandPalette({ onNavigate }: { onNavigate: (tab: TabKey) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const {
    playSong,
    playPlaylist,
    togglePlayPause,
    nextSong,
    previousSong,
    isPlaying,
    currentSong,
    toggleLike,
    isLiked,
  } = usePlayer();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (open || typing) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "ArrowRight" && e.shiftKey) {
        nextSong();
      } else if (e.key === "ArrowLeft" && e.shiftKey) {
        previousSong();
      } else if ((e.key === "l" || e.key === "L") && currentSong) {
        toggleLike(currentSong.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, togglePlayPause, nextSong, previousSong, currentSong, toggleLike]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return (uniqueSongs as Song[]).slice(0, 6);
    return (uniqueSongs as Song[])
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.singer || s.artist || "").toLowerCase().includes(q) ||
          (s.movie || "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query]);

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
    setQuery("");
  };

  const navItems: { key: TabKey; label: string; Icon: typeof Home }[] = [
    { key: "home", label: "Home", Icon: Home },
    { key: "discover", label: "Discover feed", Icon: Clapperboard },
    { key: "search", label: "Search", Icon: SearchIcon },
    { key: "library", label: "Your library", Icon: Library },
    { key: "profile", label: "Profile & stats", Icon: User },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open command bar"
        className="fixed right-4 bottom-[150px] z-40 grid h-12 w-12 place-items-center rounded-full border border-red-800/50 bg-zinc-950/90 text-red-500 shadow-[0_0_28px_-6px_rgba(220,38,38,0.9)] backdrop-blur transition hover:scale-105 active:scale-95"
      >
        <CommandIcon className="h-5 w-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search songs, or type a command..."
        />
        <CommandList>
          <CommandEmpty>Nothing found.</CommandEmpty>

          <CommandGroup heading="Songs">
            {results.map((s) => (
              <CommandItem
                key={s.id}
                value={`${s.title} ${s.singer || s.artist}`}
                onSelect={() => run(() => playSong(s))}
              >
                <img src={s.imageUrl} alt="" className="mr-2 h-7 w-7 rounded object-cover" />
                <span className="truncate">{s.title}</span>
                <span className="ml-2 truncate text-xs text-zinc-500">
                  {s.singer || s.artist}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Playback">
            <CommandItem onSelect={() => run(togglePlayPause)}>
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
              <CommandShortcut>Space</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(nextSong)}>
              <SkipForward className="mr-2 h-4 w-4" /> Next track
              <CommandShortcut>⇧→</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(previousSong)}>
              <SkipBack className="mr-2 h-4 w-4" /> Previous track
              <CommandShortcut>⇧←</CommandShortcut>
            </CommandItem>
            {currentSong && (
              <>
                <CommandItem onSelect={() => run(() => toggleLike(currentSong.id))}>
                  <Heart className="mr-2 h-4 w-4" />
                  {isLiked(currentSong.id) ? "Unlike this song" : "Like this song"}
                  <CommandShortcut>L</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => run(() => playPlaylist(buildRadio(currentSong)))}>
                  <Radio className="mr-2 h-4 w-4" /> Start radio from this song
                </CommandItem>
              </>
            )}
            <CommandItem
              onSelect={() =>
                run(() =>
                  playPlaylist([...(uniqueSongs as Song[])].sort(() => Math.random() - 0.5).slice(0, 50))
                )
              }
            >
              <Shuffle className="mr-2 h-4 w-4" /> Shuffle everything
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Go to">
            {navItems.map(({ key, label, Icon }) => (
              <CommandItem key={key} onSelect={() => run(() => onNavigate(key))}>
                <Icon className="mr-2 h-4 w-4" /> {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
