import { useState } from "react";
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

function AppShell() {
  const { currentSong } = usePlayer();
  const [tab, setTab] = useState<TabKey>("home");
  const [fullOpen, setFullOpen] = useState(false);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050005] text-white">
      {tab === "home" && <HomeView onOpenSearch={() => setTab("search")} />}
      {tab === "discover" && <DiscoverFeed onExpand={() => setFullOpen(true)} />}
      {tab === "search" && <SearchView onClose={() => setTab("home")} />}
      {tab === "library" && <LibraryView />}

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
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      {splashDone && <AppShell />}
      <Toaster position="top-center" theme="dark" />
    </TooltipProvider>
  );
}
