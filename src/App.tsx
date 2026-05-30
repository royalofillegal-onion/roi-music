
import React, { Suspense, lazy, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import { SidebarProvider, useSidebarState } from "./context/SidebarContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/Navbar";
import Player from "./components/Player";
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import { isMaintenanceActive } from "./config/maintenance";
import { useIsMobile } from "./hooks/use-mobile";

// Lazy load pages
const Index = lazy(() => import("./Pages/Index"));
const Search = lazy(() => import("./Pages/Search"));
const PlaylistView = lazy(() => import("./Pages/PlaylistView"));
const Playlists = lazy(() => import("./Pages/Playlists"));
const LikedSongs = lazy(() => import("./Pages/LikedSongs"));
const Artists = lazy(() => import("./Pages/Artists"));
const Artist = lazy(() => import("./Pages/Artist"));
const Live = lazy(() => import("./Pages/Live"));
const Auth = lazy(() => import("./Pages/Auth"));
const Settings = lazy(() => import("./Pages/Settings"));
const Feedback = lazy(() => import("./Pages/Feedback"));
const TermsAndConditions = lazy(() => import("./Pages/TermsAndConditions"));
const SharedSong = lazy(() => import("./Pages/SharedSong"));
const SharedPlaylist = lazy(() => import("./Pages/SharedPlaylist"));
const SongDetail = lazy(() => import("./Pages/SongDetail"));
const NowPlaying = lazy(() => import("./Pages/NowPlaying"));
const NotFound = lazy(() => import("./Pages/NotFound"));
const UserSettings = lazy(() => import("./Pages/UserSettings"));
const ServerMaintenance = lazy(() => import("./Pages/ServerMaintenance"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Inner component to access sidebar + auth context
function AppContent() {
  const [splashDone, setSplashDone] = useState(false);
  const { isCollapsed } = useSidebarState();
  const { loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p>Loading ROI MUSIC...</p>
      </div>
    </div>
  );

  const maintenanceActive = isMaintenanceActive();
  const mainMargin = isMobile ? "" : isCollapsed ? "ml-16" : "ml-64";

  // Splash stays up until BOTH the visual animation finished AND the session
  // restore completed — so users land directly on Home with no flash of /auth.
  const showSplash = !splashDone || authLoading;

  // Wrap a route element behind auth.
  const guarded = (el: React.ReactNode) => <ProtectedRoute>{el}</ProtectedRoute>;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {showSplash && <SplashScreen onFinish={() => setSplashDone(true)} />}

      {maintenanceActive ? (
        <main className="flex-1">
          <Suspense fallback={<LoadingFallback />}>
            <ServerMaintenance />
          </Suspense>
        </main>
      ) : (
        <>
          <Navbar />
          <main className={`flex-1 pb-20 md:pb-0 transition-all duration-300 ${mainMargin}`}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public auth + sharing + legal */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/maintenance" element={<ServerMaintenance />} />
                <Route path="/share/:hashCode" element={<SharedSong />} />
                <Route path="/song/:songId" element={<SharedSong />} />
                <Route path="/s/:hashCode" element={<SharedSong />} />
                <Route path="/shared/:hashCode" element={<SharedSong />} />
                <Route path="/music/:hashCode" element={<SharedSong />} />
                <Route path="/track/:hashCode" element={<SharedSong />} />
                <Route path="/shared-playlist/:encodedData" element={<SharedPlaylist />} />

                {/* Protected app routes */}
                <Route path="/" element={guarded(<Index />)} />
                <Route path="/search" element={guarded(<Search />)} />
                <Route path="/playlists" element={guarded(<Playlists />)} />
                <Route path="/playlist/:id" element={guarded(<PlaylistView />)} />
                <Route path="/liked" element={guarded(<LikedSongs />)} />
                <Route path="/artists" element={guarded(<Artists />)} />
                <Route path="/artist/:artistName" element={guarded(<Artist />)} />
                <Route path="/live" element={guarded(<Live />)} />
                <Route path="/settings" element={guarded(<Settings />)} />
                <Route path="/user-settings" element={guarded(<UserSettings />)} />
                <Route path="/feedback" element={guarded(<Feedback />)} />
                <Route path="/song-detail/:songId" element={guarded(<SongDetail />)} />
                <Route path="/now-playing" element={guarded(<NowPlaying />)} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Player />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <PlayerProvider>
              <SidebarProvider>
                <TooltipProvider>
                  <AppContent />
                </TooltipProvider>
              </SidebarProvider>
            </PlayerProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
