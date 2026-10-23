import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { HomeView } from "@/views/HomeView";
import { FullPlayer } from "@/views/FullPlayer";
import { MiniPlayer } from "@/views/MiniPlayer";
import { SearchView } from "@/views/SearchView";
import { DiscoverFeed } from "@/views/DiscoverFeed";
import { LibraryView } from "@/views/LibraryView";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { BackgroundPlaybackPrompt } from "@/components/BackgroundPlaybackPrompt";
import SplashScreen from "@/components/SplashScreen";
import { usePlayer } from "@/context/PlayerContext";
import { importSharedPlaylistFromUrl } from "@/lib/playlistStore";
import { ProfileView } from "@/views/ProfileView";
import { AuthView } from "@/views/AuthView";
import { AuthProvider } from "@/context/AuthContext";
import { useLibrarySync } from "@/lib/cloudLibrary";
import { useListeningTracker } from "@/lib/listeningStats";
import { CommandPalette } from "@/components/CommandPalette";

function AppShell() {
  const { currentSong, likedSongs } = usePlayer();
  const [tab, setTab] = useState<TabKey>("home");
  const [fullOpen, setFullOpen] = useState(false);
  const [sharedImported, setSharedImported] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  useLibrarySync(likedSongs);
  useListeningTracker(currentSong);

  useEffect(() => {
    const imported = importSharedPlaylistFromUrl();
    if (imported) {
      setSharedImported(true);
      setTab("library");
      toast.success(`Added "${imported.name}" to your playlists`);
    }
  }, []);


  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050005] text-white">
      <div key={tab} className="view-enter">
        {tab === "home" && <HomeView onOpenSearch={() => setTab("search")} />}
        {tab === "discover" && <DiscoverFeed onExpand={() => setFullOpen(true)} />}
        {tab === "search" && <SearchView onClose={() => setTab("home")} />}
        {tab === "library" && <LibraryView initialTab={sharedImported ? "playlists" : "liked"} />}
        {tab === "profile" && <ProfileView onSignIn={() => setAuthOpen(true)} />}
      </div>

      <CommandPalette onNavigate={setTab} />


      {authOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
          <AuthView onClose={() => setAuthOpen(false)} />
        </div>
      )}

      {currentSong && !fullOpen && <MiniPlayer onExpand={() => setFullOpen(true)} />}
      <BottomNav active={tab} onChange={setTab} />
      <BackgroundPlaybackPrompt />
      {currentSong && fullOpen && <FullPlayer onClose={() => setFullOpen(false)} />}
    </div>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  return (
    <TooltipProvider>
      <AuthProvider>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      {splashDone && <AppShell />}
      </AuthProvider>
      <Toaster position="top-center" theme="dark" />
    </TooltipProvider>
  );
}
