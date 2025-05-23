import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./components/Navbar";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Live from "./pages/Live";
import Player from "./pages/Player";
import Search from "./pages/Search";
import Trending from "./pages/Trending";
import Upload from "./pages/Upload";
import { AdminProvider } from "./context/AdminContext";
import { PlayerProvider } from "./context/PlayerContext";
import { LiveAdminProvider } from "./context/LiveAdminContext";

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    // Define routes where the Navbar should be hidden
    const hiddenRoutes = ["/admin", "/upload"];

    // Check if the current route is in the hiddenRoutes array
    setShowNavbar(!hiddenRoutes.includes(location.pathname));
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <PlayerProvider>
            <BrowserRouter>
              <AdminProvider>
                <LiveAdminProvider>
                  <div className="flex h-full bg-background text-foreground antialiased">
                    {showNavbar && <Navbar />}
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/trending" element={<Trending />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/live" element={<Live />} />
                      <Route path="/player/:id" element={<Player />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/upload" element={<Upload />} />
                    </Routes>
                  </div>
                </LiveAdminProvider>
              </AdminProvider>
            </BrowserRouter>
          </PlayerProvider>
        </ThemeProvider>
      </TooltipProvider>
      <Toaster position="top-center" expand={false} />
    </QueryClientProvider>
  );
}

export default App;
