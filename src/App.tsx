
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
import Live from "./pages/Live";
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
import { 
  isAndroidWebView, 
  requestBackgroundPlayback 
} from "./services/androidNotification";
import { setupOneSignal, isOneSignalAvailable } from "./services/OneSignalService";
import { toast } from "sonner";
import EnhancedPlayer from "@/components/EnhancedPlayer";

// OneSignal type is now defined in the respective service files

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [serviceWorkerReg, setServiceWorkerReg] = useState<ServiceWorkerRegistration | null>(null);
  const [oneSignalInitialized, setOneSignalInitialized] = useState(false);

  // Add playback state here
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastPlayedSong, setLastPlayedSong] = useState<string | null>(null);
  const [lastPlayedPosition, setLastPlayedPosition] = useState<number>(0);
  const [activeSongId, setActiveSongId] = useState<string | null>(null);

  // Your existing authentication check and notification setup logic
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthenticated(!!session);
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('auth.session');
        localStorage.removeItem('supabase.auth.token');
      } else if (event === 'SIGNED_IN' && session) {
        // Get user's last played song
        getSavedPlaybackState(session.user.id);
      }
    });
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthenticated(!!session);
        if (session) {
          // Get user's last played song
          getSavedPlaybackState(session.user.id);
        }
      } catch {
        setAuthenticated(false);
      }
    };
    
    checkAuth();
    return () => subscription.unsubscribe();
  }, []);

  // Function to get saved playback state
  const getSavedPlaybackState = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('active_song_id, active_song_position, is_playing')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setActiveSongId(data.active_song_id);
        setLastPlayedSong(data.active_song_id);
        setLastPlayedPosition(data.active_song_position || 0);
        setIsPlaying(data.is_playing || false);
        
        // Dispatch an event to notify the player to resume playback
        if (data.active_song_id) {
          document.dispatchEvent(new CustomEvent('restore-playback', { 
            detail: { 
              songId: data.active_song_id,
              position: data.active_song_position,
              play: data.is_playing
            } 
          }));
        }
      }
    } catch (error) {
      console.error('Error getting saved playback state:', error);
    }
  };

  // Update playback state when song changes or playback state changes
  useEffect(() => {
    const updatePlaybackState = async () => {
      if (!authenticated) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const { error } = await supabase
          .from('users')
          .update({
            active_song_id: activeSongId,
            active_song_position: lastPlayedPosition,
            is_playing: isPlaying
          })
          .eq('user_id', session.user.id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error updating playback state:', error);
      }
    };

    if (activeSongId !== lastPlayedSong || isPlaying !== undefined) {
      updatePlaybackState();
    }
  }, [activeSongId, isPlaying, lastPlayedPosition, authenticated]);

  // Listen for playback events from the player
  useEffect(() => {
    const handlePlaybackChange = (event: CustomEvent) => {
      const { songId, position, playing } = event.detail;
      setActiveSongId(songId);
      setLastPlayedPosition(position);
      setIsPlaying(playing);
    };

    document.addEventListener('playback-changed', handlePlaybackChange as EventListener);
    
    return () => {
      document.removeEventListener('playback-changed', handlePlaybackChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (appReady) {
      // Initialize OneSignal
      const initOneSignal = () => {
        const result = setupOneSignal();
        setOneSignalInitialized(result);
        if (result) {
          console.log("OneSignal initialized successfully");
          toast.success('OneSignal notifications enabled');
        }
      };
      
      const setupNotifications = async () => {
        try {
          // First try to set up OneSignal
          initOneSignal();
          
          // Then set up regular notifications as fallback
          const permission = await requestNotificationPermission();
          if (permission === 'granted') {
            toast.success('Notifications enabled for new songs');
            if ('serviceWorker' in navigator) {
              const registration = await registerServiceWorker();
              setServiceWorkerReg(registration);
              
              if (registration && isMobileDevice()) {
                const subscription = await subscribeToPushNotifications(registration);
                if (subscription && authenticated) {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session) {
                    console.log('Push subscription:', JSON.stringify(subscription));
                    toast.success('Push notifications enabled');
                    
                    // Request Android background playback if applicable
                    if (isAndroidWebView()) {
                      requestBackgroundPlayback();
                      toast.success('Background playback enabled');
                    }
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

  // Add event listener for service worker messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'media-control') {
          handleMediaControl(event.data.action);
        }
      });
    }
    
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', () => {});
      }
    };
  }, []);
  
  // Handle media controls from service worker
  const handleMediaControl = (action: string) => {
    console.log('Received media control action:', action);
    switch (action) {
      case 'play':
        setIsPlaying(true);
        break;
      case 'pause':
        setIsPlaying(false);
        break;
      case 'next':
        // The player component will handle this via the usePlayer hook
        document.dispatchEvent(new CustomEvent('media-control', { detail: { action: 'next' } }));
        break;
      case 'previous':
        // The player component will handle this via the usePlayer hook
        document.dispatchEvent(new CustomEvent('media-control', { detail: { action: 'previous' } }));
        break;
    }
  };

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
                  <Route path="/live" element={<Live />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/auth" element={authenticated ? <Navigate to="/" /> : <Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>

                {/* Pass playback state to EnhancedPlayer */}
                <EnhancedPlayer isPlaying={isPlaying} />
              </div>
            </AdminProvider>
          </BrowserRouter>
        </PlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
