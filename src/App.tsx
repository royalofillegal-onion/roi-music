import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { HomeView } from "@/views/HomeView";
import { FullPlayer } from "@/views/FullPlayer";
import { MiniPlayer } from "@/views/MiniPlayer";
import { SearchView } from "@/views/SearchView";
import SplashScreen from "@/components/SplashScreen";
import { usePlayer } from "@/context/PlayerContext";
import { getDeviceId } from "@/lib/deviceTracker";

function AppShell() {
  const { currentSong } = usePlayer();
  const [fullOpen, setFullOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (currentSong) setFullOpen(true);
  }, [currentSong?.id]);

  useEffect(() => {
    try { getDeviceId(); } catch { /* ignore */ }
  }, []);

  return (
    <div className="min-h-dvh bg-[#0a0418] text-white overflow-x-hidden">
      <HomeView onOpenSearch={() => setSearchOpen(true)} />
      {searchOpen && <SearchView onClose={() => setSearchOpen(false)} />}
      {currentSong && !fullOpen && <MiniPlayer onExpand={() => setFullOpen(true)} />}
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
