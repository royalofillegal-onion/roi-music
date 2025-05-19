import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Playlists from "./pages/Playlists";
import PlaylistView from "./pages/PlaylistView";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import UserSettings from "./pages/UserSettings";
import LikedSongs from "./pages/LikedSongs";
import Reels from "./pages/Reels";
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import { PlayerProvider } from "./context/PlayerContext";
import { AdminProvider } from "./context/AdminContext";
import { supabase } from "./integrations/supabase/client";
import { 
  requestNotificationPermission, 
  isMobileDevice,
  registerServiceWorker,
  subscribeToPushNotifications
} from "./services/NotificationService";
import { toast } from "sonner";
import EnhancedPlayer from "@/components/EnhancedPlayer";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  // Add playback state here
  const [isPlaying, setIsPlaying] = useState(false);

  // Your existing authentication check and notification setup logic (no change)
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
            if ('serviceWorker' in navigator) {
              const registration = await registerServiceWorker();
              if (registration && isMobileDevice()) {
                const subscription = await subscribeToPushNotifications(registration);
                if (subscription && authenticated) {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session) {
                    console.log('Push subscription:', JSON.stringify(subscription));
                    toast.success('Push notifications enabled');
                    // TODO: Save subscription to DB if ready
                  }
                }
              }
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

  useEffect(() => {
    document.body.classList.add('bg-gradient-to-b', 'from-gray-900', 'to-black');
    document.title = "RoyalStar Music - Pro Advanced Edition";
    return () => {
      document.body.classList.remove('bg-gradient-to-b', 'from-gray-900', 'to-black');
    };
  }, []);

  // For demo: You can add some buttons to control playback state
  // Or connect this to your actual PlayerContext playback controls

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerProvider>
          <BrowserRouter>
            <AdminProvider>
              <Toaster />
              <Sonner />

              {showSplash && <SplashScreen onFinish={handleSplashFinished} />}

              <div className={`min-h-screen bg-gradient-to-b from-gray-900 to-black text-white transition-opacity duration-500 ${appReady ? 'opacity-100' : 'opacity-0'}`}>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/playlists" element={<Playlists />} />
                  <Route path="/playlist/:id" element={<PlaylistView />} />
                  <Route path="/liked" element={authenticated ? <LikedSongs /> : <Navigate to="/auth" />} />
                  <Route path="/settings" element={authenticated ? <UserSettings /> : <Navigate to="/auth" />} />
                  <Route path="/reels" element={<Reels />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/auth" element={authenticated ? <Navigate to="/" /> : <Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>

                {/* Pass playback state to EnhancedPlayer */}
                <EnhancedPlayer isPlaying={isPlaying} />

                {/* Demo controls to toggle playback (remove if you have actual playback controls elsewhere) */}
                <div className="fixed bottom-4 right-4 space-x-2">
                  <button onClick={() => setIsPlaying(true)} className="bg-green-600 px-4 py-2 rounded">Play</button>
                  <button onClick={() => setIsPlaying(false)} className="bg-red-600 px-4 py-2 rounded">Pause</button>
                </div>
              </div>
            </AdminProvider>
          </BrowserRouter>
        </PlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
