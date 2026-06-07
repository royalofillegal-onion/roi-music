
import React, { Suspense, lazy, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import { SidebarProvider, useSidebarState } from "./context/SidebarContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Player from "./components/Player";
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import { isMaintenanceActive } from "./config/maintenance";
import { useIsMobile } from "./hooks/use-mobile";
import { Loader2 } from "lucide-react";

// Public routes (anything else requires login)
const PUBLIC_ROUTES = ["/auth", "/forgot-password", "/terms", "/share", "/song/", "/s/", "/shared/", "/music/", "/track/", "/shared-playlist"];

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

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
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword"));
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

// Routes that render WITHOUT navbar/player/sidebar chrome
const CHROMELESS_ROUTES = ["/auth", "/forgot-password"];

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { isCollapsed } = useSidebarState();
  const isMobile = useIsMobile();
  const location = useLocation();

  const handleSplashFinish = () => setShowSplash(false);

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
  const chromeless = CHROMELESS_ROUTES.some((p) => location.pathname.startsWith(p));

  if (maintenanceActive) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <main className="flex-1">
          <Suspense fallback={<LoadingFallback />}>
            <ServerMaintenance />
          </Suspense>
        </main>
      </div>
    );
  }

  // Login-only chrome: no Navbar, no Player, no sidebar margin
  if (chromeless) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <Navbar />
        <main className={`flex-1 pb-20 md:pb-0 transition-all duration-300 ${mainMargin}`}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlist/:id" element={<PlaylistView />} />
              <Route path="/liked" element={<LikedSongs />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/artist/:artistName" element={<Artist />} />
              <Route path="/live" element={<Live />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/user-settings" element={<UserSettings />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/maintenance" element={<ServerMaintenance />} />
              <Route path="/song-detail/:songId" element={<SongDetail />} />
              <Route path="/now-playing" element={<NowPlaying />} />
              <Route path="/share/:hashCode" element={<SharedSong />} />
              <Route path="/song/:songId" element={<SharedSong />} />
              <Route path="/s/:hashCode" element={<SharedSong />} />
              <Route path="/shared/:hashCode" element={<SharedSong />} />
              <Route path="/music/:hashCode" element={<SharedSong />} />
              <Route path="/track/:hashCode" element={<SharedSong />} />
              <Route path="/shared-playlist/:encodedData" element={<SharedPlaylist />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Player />
      </div>
    </RequireAuth>
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
