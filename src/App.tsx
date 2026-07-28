import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { HomeView } from "@/views/HomeView";
import { FullPlayer } from "@/views/FullPlayer";
import { MiniPlayer } from "@/views/MiniPlayer";
import { usePlayer } from "@/context/PlayerContext";

function AppShell() {
  const { currentSong } = usePlayer();
  const [fullOpen, setFullOpen] = useState(false);

  useEffect(() => {
    if (currentSong) setFullOpen(true);
  }, [currentSong?.id]);

  return (
    <div className="min-h-dvh bg-black text-white overflow-x-hidden">
      <HomeView />
      {currentSong && !fullOpen && <MiniPlayer onExpand={() => setFullOpen(true)} />}
      {currentSong && fullOpen && <FullPlayer onClose={() => setFullOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <AppShell />
      <Toaster position="top-center" theme="dark" />
    </TooltipProvider>
  );
}
