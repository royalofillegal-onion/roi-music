import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { HomeView } from "@/views/HomeView";
import { FullPlayer } from "@/views/FullPlayer";
import { MiniPlayer } from "@/views/MiniPlayer";
import { SearchView } from "@/views/SearchView";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";
import { usePlayer } from "@/context/PlayerContext";
import { ProfileView } from "@/views/ProfileView";
import { AuthProvider } from "@/context/AuthContext";
import { useLibrarySync } from "@/lib/cloudLibrary";
import { useListeningTracker } from "@/lib/listeningStats";

function AppShell() {
  const { currentSong, likedSongs } = usePlayer();
  const [tab, setTab] = useState<TabKey>("home");
  const [fullOpen, setFullOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  useLibrarySync(likedSongs);
  useListeningTracker(currentSong);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050005] text-white">
      <div key={tab} className="view-enter">
        {tab === "home" && <HomeView onOpenSearch={() => setTab("search")} onOpenAccount={() => setAccountOpen(true)} />}
        {tab === "search" && <SearchView onClose={() => setTab("home")} />}
      </div>

      {accountOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
          <ProfileView onSignIn={() => setAccountOpen(true)} onClose={() => setAccountOpen(false)} />
        </div>
      )}

      {currentSong && !fullOpen && <MiniPlayer onExpand={() => setFullOpen(true)} />}
      <BottomNav active={tab} onChange={setTab} />
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
