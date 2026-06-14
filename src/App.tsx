import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { HomeView } from "@/views/HomeView";
import { FullPlayer } from "@/views/FullPlayer";
import { MiniPlayer } from "@/views/MiniPlayer";
import { SearchView } from "@/views/SearchView";
import { AuthGate } from "@/views/AuthGate";
import { AdminDashboard } from "@/views/AdminDashboard";
import SplashScreen from "@/components/SplashScreen";
import { usePlayer } from "@/context/PlayerContext";
import { useSession } from "@/lib/session";
import { usePlayerEventSync } from "@/hooks/usePlayerEventSync";

function AppShell() {
  const { currentSong } = usePlayer();
  const { token, loading } = useSession();
  const [fullOpen, setFullOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Mirror plays / likes to the backend for the signed-in user.
  usePlayerEventSync();

  // Auto-open full player whenever a song starts.
  useEffect(() => {
    if (currentSong) setFullOpen(true);
  }, [currentSong?.id]);

  if (loading) {
    return <div className="min-h-dvh bg-[#0a0418]" />;
  }

  if (!token) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-dvh bg-[#0a0418] text-white overflow-x-hidden">
      <HomeView onOpenSearch={() => setSearchOpen(true)} onOpenAdmin={() => setAdminOpen(true)} />
      {searchOpen && <SearchView onClose={() => setSearchOpen(false)} />}
      {adminOpen && <AdminDashboard onClose={() => setAdminOpen(false)} />}
      {currentSong && !fullOpen && (
        <MiniPlayer onExpand={() => setFullOpen(true)} />
      )}
      {currentSong && fullOpen && (
        <FullPlayer onClose={() => setFullOpen(false)} />
      )}
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
