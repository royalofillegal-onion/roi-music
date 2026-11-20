import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import type { Song } from "@/data/Song";
import { fetchPublishedCloudSongs } from "@/lib/cloudSongCatalog";
import { AdminCatalogView } from "@/views/AdminCatalogView";
import { uniqueSongs } from "@/data/allSongs";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { AuthView } from "@/views/AuthView";

function AppShell() {
  const { currentSong, likedSongs } = usePlayer();
  const [tab, setTab] = useState<TabKey>("home");
  const [fullOpen, setFullOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cloudSongs, setCloudSongs] = useState<Song[]>([]);
  useLibrarySync(likedSongs);
  useListeningTracker(currentSong);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) return;
    fetchPublishedCloudSongs().then((songs) => {
      if (!active) return;
      for (const song of songs) {
        if (!uniqueSongs.some((existing) => existing.id === song.id)) uniqueSongs.push(song);
      }
      setCloudSongs(songs);
    }).catch((error) => {
      if (active) toast.error(error instanceof Error ? error.message : "Unable to load published songs");
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050005] text-white">
      <div key={tab} className="view-enter">
        {tab === "home" && <HomeView cloudSongs={cloudSongs} onOpenSearch={() => setTab("search")} onOpenAccount={() => setAccountOpen(true)} />}
        {tab === "search" && <SearchView cloudSongs={cloudSongs} onClose={() => setTab("home")} />}
      </div>

      {accountOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
          <ProfileView onSignIn={() => { setAccountOpen(false); setAuthOpen(true); }} onClose={() => setAccountOpen(false)} onOpenAdmin={() => { setAccountOpen(false); setAdminOpen(true); }} />
        </div>
      )}

      {authOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-background">
          <AuthView onClose={() => { setAuthOpen(false); setAccountOpen(true); }} />
        </div>
      )}

      {currentSong && !fullOpen && <MiniPlayer onExpand={() => setFullOpen(true)} />}
      <BottomNav active={tab} onChange={setTab} />
      {currentSong && fullOpen && <FullPlayer onClose={() => setFullOpen(false)} />}
      {adminOpen && <AdminCatalogView onClose={() => {
        setAdminOpen(false);
        if (!isSupabaseConfigured) return;
        void fetchPublishedCloudSongs().then((songs) => {
          for (const song of songs) {
            if (!uniqueSongs.some((existing) => existing.id === song.id)) uniqueSongs.push(song);
          }
          setCloudSongs(songs);
        }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to refresh songs"));
      }} />}
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
