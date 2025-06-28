
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/context/PlayerContext";
import Index from "./Pages/Index";
import Search from "./Pages/Search";
import LikedSongs from "./Pages/LikedSongs";
import Playlists from "./Pages/Playlists";
import PlaylistView from "./Pages/PlaylistView";
import Artists from "./Pages/Artists";
import Settings from "./Pages/Settings";
import Auth from "./Pages/Auth";
import UserSettings from "./Pages/UserSettings";
import Live from "./Pages/Live";
import Admin from "./Pages/Admin";
import AdminLogin from "./Pages/AdminLogin";
import AdminLive from "./Pages/AdminLive";
import Feedback from "./Pages/Feedback";
import TermsAndConditions from "./Pages/TermsAndConditions";
import NotFound from "./Pages/NotFound";
import SharedSong from "./Pages/SharedSong";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <PlayerProvider>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/liked" element={<LikedSongs />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/playlist/:id" element={<PlaylistView />} />
                <Route path="/artists" element={<Artists />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/user-settings" element={<UserSettings />} />
                <Route path="/live" element={<Live />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-live" element={<AdminLive />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/share/:hashCode" element={<SharedSong />} />
                <Route path="/s/:hashCode" element={<SharedSong />} />
                <Route path="/song/:hashCode" element={<SharedSong />} />
                <Route path="/shared/:hashCode" element={<SharedSong />} />
                <Route path="/music/:hashCode" element={<SharedSong />} />
                <Route path="/track/:hashCode" element={<SharedSong />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </PlayerProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
