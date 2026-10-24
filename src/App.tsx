import { useEffect, useState } from "react";
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
import { fetchMongoSongs } from "@/lib/mongoCatalog";
import { AdminCatalogView } from "@/views/AdminCatalogView";
import { uniqueSongs } from "@/data/allSongs";

function AppShell() {
  const { currentSong, likedSongs } = usePlayer();
  const [tab, setTab] = useState<TabKey>("home");
  const [fullOpen, setFullOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [mongoSongs, setMongoSongs] = useState<Song[]>([]);
  useLibrarySync(likedSongs);
  useListeningTracker(currentSong);

  useEffect(() => {
    let active = true;
    fetchMongoSongs().then((songs) => {
      if (!active) return;
      for (const song of songs) {
        if (!uniqueSongs.some((existing) => existing.id === song.id)) uniqueSongs.push(song);
      }
      setMongoSongs(songs);
    }).catch(() => {
      // MongoDB is optional in local/static deployments; bundled catalog remains available.
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050005] text-white">
      <div key={tab} className="view-enter">
        {tab === "home" && <HomeView mongoSongs={mongoSongs} onOpenSearch={() => setTab("search")} onOpenAccount={() => setAccountOpen(true)} />}
        {tab === "search" && <SearchView mongoSongs={mongoSongs} onClose={() => setTab("home")} />}
      </div>

      {accountOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
          <ProfileView onSignIn={() => setAccountOpen(true)} onClose={() => setAccountOpen(false)} onOpenAdmin={() => { setAccountOpen(false); setAdminOpen(true); }} />
        </div>
      )}

      {currentSong && !fullOpen && <MiniPlayer onExpand={() => setFullOpen(true)} />}
      <BottomNav active={tab} onChange={setTab} />
      {currentSong && fullOpen && <FullPlayer onClose={() => setFullOpen(false)} />}
      {adminOpen && <AdminCatalogView onClose={() => {
        setAdminOpen(false);
        void fetchMongoSongs().then((songs) => {
          for (const song of songs) {
            if (!uniqueSongs.some((existing) => existing.id === song.id)) uniqueSongs.push(song);
          }
          setMongoSongs(songs);
        }).catch(() => {});
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
