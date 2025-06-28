
import { Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import { AdminProvider } from "./context/AdminContext";
import { LiveAdminProvider } from "./context/LiveAdminContext";
import Navbar from "./components/Navbar";
import Player from "./components/Player";
import SplashScreen from "./components/SplashScreen";

// Lazy load pages
const Index = lazy(() => import("./Pages/Index"));
const Search = lazy(() => import("./Pages/Search"));
const PlaylistView = lazy(() => import("./Pages/PlaylistView"));
const Playlists = lazy(() => import("./Pages/Playlists"));
const LikedSongs = lazy(() => import("./Pages/LikedSongs"));
const Artists = lazy(() => import("./Pages/Artists"));
const Live = lazy(() => import("./Pages/Live"));
const Auth = lazy(() => import("./Pages/Auth"));
const Settings = lazy(() => import("./Pages/Settings"));
const UserSettings = lazy(() => import("./Pages/UserSettings"));
const Feedback = lazy(() => import("./Pages/Feedback"));
const TermsAndConditions = lazy(() => import("./Pages/TermsAndConditions"));
const Admin = lazy(() => import("./Pages/Admin"));
const AdminLogin = lazy(() => import("./Pages/AdminLogin"));
const AdminLive = lazy(() => import("./Pages/AdminLive"));
const SharedSong = lazy(() => import("./Pages/SharedSong"));
const NotFound = lazy(() => import("./Pages/NotFound"));

const queryClient = new QueryClient();

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerProvider>
          <BrowserRouter>
            <AdminProvider>
              <LiveAdminProvider>
                <div className="flex flex-col min-h-screen bg-gray-900 text-white">
                  {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
                  <Navbar />
                  <main className="flex-1">
                    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/playlists" element={<Playlists />} />
                        <Route path="/playlist/:id" element={<PlaylistView />} />
                        <Route path="/liked" element={<LikedSongs />} />
                        <Route path="/artists" element={<Artists />} />
                        <Route path="/live" element={<Live />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/user-settings" element={<UserSettings />} />
                        <Route path="/feedback" element={<Feedback />} />
                        <Route path="/terms" element={<TermsAndConditions />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/live/royal" element={<AdminLive />} />
                        
                        {/* Enhanced song sharing routes for universal accessibility */}
                        <Route path="/share/:hashCode" element={<SharedSong />} />
                        <Route path="/song/:songId" element={<SharedSong />} />
                        <Route path="/s/:hashCode" element={<SharedSong />} />
                        <Route path="/shared/:hashCode" element={<SharedSong />} />
                        <Route path="/music/:hashCode" element={<SharedSong />} />
                        <Route path="/track/:hashCode" element={<SharedSong />} />
                        
                        {/* Catch-all route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Player />
                </div>
                <Toaster />
              </LiveAdminProvider>
            </AdminProvider>
          </BrowserRouter>
        </PlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
