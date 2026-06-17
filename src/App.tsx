import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { HomeView } from "@/views/HomeView";
import { FullPlayer } from "@/views/FullPlayer";
import { MiniPlayer } from "@/views/MiniPlayer";
import { SearchView } from "@/views/SearchView";
import { AdminPanel } from "@/views/AdminPanel";
import SplashScreen from "@/components/SplashScreen";
import { usePlayer } from "@/context/PlayerContext";
import { getDeviceId } from "@/lib/deviceTracker";
import { syncDevice } from "@/lib/cloudTracker";

// Secret admin route — clean path that works on any domain
const ADMIN_PATHS = ["/hash/adminpanel/access", "/hash/adminpanel"];

function isAdminPath(): boolean {
  const raw = window.location.pathname.replace(/\/+$/, "") || "/";
  return ADMIN_PATHS.includes(raw);
}

function AppShell() {
  const { currentSong } = usePlayer();
  const [fullOpen, setFullOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(isAdminPath());

  useEffect(() => {
    if (currentSong) setFullOpen(true);
  }, [currentSong?.id]);

  useEffect(() => {
    // ensure device id exists from app start
    try { getDeviceId(); syncDevice(); } catch { /* ignore */ }
    const onPop = () => setAdminOpen(isAdminPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div className="min-h-dvh bg-[#0a0418] text-white overflow-x-hidden">
      <HomeView onOpenSearch={() => setSearchOpen(true)} />
      {searchOpen && <SearchView onClose={() => setSearchOpen(false)} />}
      {currentSong && !fullOpen && <MiniPlayer onExpand={() => setFullOpen(true)} />}
      {currentSong && fullOpen && <FullPlayer onClose={() => setFullOpen(false)} />}
      {adminOpen && (
        <AdminPanel
          onClose={() => {
            setAdminOpen(false);
            window.history.replaceState(null, "", "/");
          }}
        />
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
