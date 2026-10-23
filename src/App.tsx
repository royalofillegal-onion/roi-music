import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PlayerScreen } from "@/views/PlayerScreen";
import { BackgroundPlaybackPrompt } from "@/components/BackgroundPlaybackPrompt";
import SplashScreen from "@/components/SplashScreen";
import { usePlayer } from "@/context/PlayerContext";
import { useListeningTracker } from "@/lib/listeningStats";

function AppShell() {
  const { currentSong } = usePlayer();
  useListeningTracker(currentSong);

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#050005] text-white">
      <PlayerScreen />
      <BackgroundPlaybackPrompt />
    </div>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  return (
    <TooltipProvider>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      {splashDone && <AppShell />}
      <Toaster position="top-center" theme="dark" />
    </TooltipProvider>
  );
}
