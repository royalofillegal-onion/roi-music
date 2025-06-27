
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./Pages/Index.tsx";
import Search from "./Pages/Search";
import Artists from "./Pages/Artists";
import TermsAndConditions from "./Pages/TermsAndConditions";
import Playlists from "./Pages/Playlists";
import PlaylistView from "./Pages/PlaylistView";
import Live from "./Pages/Live";
import Admin from "./Pages/Admin";
import AdminLogin from "./Pages/AdminLogin";
import AdminLive from "./Pages/AdminLive";
import NotFound from "./Pages/NotFound";
import Auth from "./Pages/Auth";
import UserSettings from "./Pages/UserSettings";
import LikedSongs from "./Pages/LikedSongs";
import Feedback from "./Pages/Feedback";
import SharedSong from "./Pages/SharedSong";
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import MusicVisualizer from "./components/MusicVisualizer";
import { PlayerProvider } from "./context/PlayerContext";
import { AdminProvider } from "./context/AdminContext";
import { LiveAdminProvider } from "./context/LiveAdminContext";
import { supabase } from "./integrations/supabase/client";
import { 
  requestNotificationPermission, 
  isMobileDevice
} from "./services/NotificationService";
import { enableContinuousPlayback } from "./services/androidNotification";
import { toast } from "sonner";
import EnhancedPlayer from "@/components/EnhancedPlayer";
import FloatingMusicInfo from "@/components/FloatingMusicInfo";
import { registerServiceWorker } from "@/services/registerServiceWorker";
import Settings from "./Pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [isPwa, setIsPwa] = useState(false);

  // Register service worker for PWA capabilities
  useEffect(() => {
    registerServiceWorker().then(() => {
      const isPwaMode = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
      setIsPwa(isPwaMode);
      
      if (isPwaMode) {
        toast.success("App running in PWA mode");
      }
    });
  }, []);

  // Enable continuous playback for APK platforms on app start
  useEffect(() => {
    enableContinuousPlayback();
    document.body.classList.add('bg-gradient-to-b', 'from-gray-900', 'to-black');
    document.title = "RoyalStar Music - Pro Advanced Edition";
    return () => {
      document.body.classList.remove('bg-gradient-to-b', 'from-gray-900', 'to-black');
    };
  }, []);

  // Your existing authentication check and notification setup logic
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthenticated(!!session);
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('auth.session');
        localStorage.removeItem('supabase.auth.token');
      }
    });
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthenticated(!!session);
      } catch {
        setAuthenticated(false);
      }
    };
    checkAuth();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (appReady) {
      const setupNotifications = async () => {
        try {
          const permission = await requestNotificationPermission();
          if (permission === 'granted') {
            toast.success('Notifications enabled for new songs');
            if (isMobileDevice()) {
              console.log('Mobile device detected - notifications ready');
            }
          }
        } catch (error) {
          console.error('Error setting up notifications:', error);
        }
      };
      setTimeout(() => setupNotifications(), 3000);
    }
  }, [appReady, authenticated]);

  const handleSplashFinished = () => {
    setAppReady(true);
    setTimeout(() => setShowSplash(false), 500);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerProvider>
          <BrowserRouter>
            <AdminProvider>
              <LiveAdminProvider>
                <Toaster />
                <Sonner />

                {showSplash && <SplashScreen onFinish={handleSplashFinished} />}

                <div className={`min-h-screen bg-gradient-to-b from-gray-900 to-black text-white transition-opacity duration-500 ${appReady ? 'opacity-100' : 'opacity-0'}`}>
                  <MusicVisualizer />
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/artists" element={<Artists />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/playlist/:id" element={<PlaylistView />} />
                    <Route path="/live" element={<Live />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/liked" element={authenticated ? <LikedSongs /> : <Navigate to="/auth" />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/live/:section" element={<AdminLive />} />
                    <Route path="/auth" element={authenticated ? <Navigate to="/" /> : <Auth />} />
                    <Route path="/share/:hashCode" element={<SharedSong />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                  <EnhancedPlayer />
                  <FloatingMusicInfo />
                </div>
              </LiveAdminProvider>
            </AdminProvider>
          </BrowserRouter>
        </PlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
