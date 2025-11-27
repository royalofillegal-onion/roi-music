
import React, { Suspense, lazy, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import SpotifySidebar from "./components/SpotifySidebar";
import EnhancedSpotifyPlayer from "./components/EnhancedSpotifyPlayer";
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import { isMaintenanceActive } from "./config/maintenance";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p>Loading ROI MUSIC...</p>
      </div>
    </div>
  );

  // Check if maintenance is active
  const maintenanceActive = isMaintenanceActive();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PlayerProvider>
          <TooltipProvider>
            <BrowserRouter>
              <SidebarProvider defaultOpen={true}>
                <div className="flex min-h-screen w-full bg-background text-foreground">
                  {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
                  
                  {/* Show maintenance page if maintenance is active */}
                  {maintenanceActive ? (
                    <main className="flex-1">
                      <Suspense fallback={<LoadingFallback />}>
                        <ServerMaintenance />
                      </Suspense>
                    </main>
                  ) : (
                    <>
                      <SpotifySidebar 
                        mobileOpen={mobileMenuOpen}
                        onMobileClose={() => setMobileMenuOpen(false)}
                      />
                      <main className="flex-1 pb-32 md:pb-24 transition-all duration-300">
                        {/* Header with trigger button */}
                        <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
                          <div className="flex items-center gap-3 px-3 md:px-4 h-14">
                            {isMobile ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(true)}
                                className="text-white hover:text-primary hover:bg-white/10 transition-colors"
                              >
                                <Menu className="h-5 w-5" />
                              </Button>
                            ) : (
                              <SidebarTrigger className="text-white hover:text-primary transition-colors">
                                <Menu className="h-5 w-5" />
                              </SidebarTrigger>
                            )}
                            
                            {/* Logo for mobile */}
                            {isMobile && (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">R</span>
                                </div>
                                <span className="text-base font-bold text-white">ROI MUSIC</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
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
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/user-settings" element={<UserSettings />} />
                            <Route path="/feedback" element={<Feedback />} />
                            <Route path="/terms" element={<TermsAndConditions />} />
                            
                            {/* Maintenance route */}
                            <Route path="/maintenance" element={<ServerMaintenance />} />
                            
                            {/* Enhanced song sharing routes */}
                            <Route path="/share/:hashCode" element={<SharedSong />} />
                            <Route path="/song/:songId" element={<SharedSong />} />
                            <Route path="/s/:hashCode" element={<SharedSong />} />
                            <Route path="/shared/:hashCode" element={<SharedSong />} />
                            <Route path="/music/:hashCode" element={<SharedSong />} />
                            <Route path="/track/:hashCode" element={<SharedSong />} />
                            
                            {/* Shared playlist route */}
                            <Route path="/shared-playlist/:encodedData" element={<SharedPlaylist />} />
                            
                            {/* Catch-all route */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </main>
                      <EnhancedSpotifyPlayer />
                    </>
                  )}
                </div>
              </SidebarProvider>
            </BrowserRouter>
          </TooltipProvider>
        </PlayerProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
