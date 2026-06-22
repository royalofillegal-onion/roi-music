import { useEffect, useState } from "react";
import { Music4, Bell } from "lucide-react";

const STORAGE_KEY = "audioPermissionGranted";

/**
 * One-time, user-friendly prompt that:
 *  - unlocks mobile audio playback (browsers require a user gesture), and
 *  - requests notification permission for lock-screen media controls.
 * Shown once; the choice is remembered in localStorage.
 */
export function AudioPermissionPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const enable = async () => {
    // Unlock audio with a silent play triggered by this user gesture.
    try {
      const a = new Audio();
      a.src =
        "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAAAA0AAAAAAAA";
      a.volume = 0;
      await a.play().catch(() => {});
      a.pause();
    } catch {
      /* ignore */
    }
    // Ask for notification permission so media controls can appear.
    try {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch {
      /* ignore */
    }
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 backdrop-blur-sm p-5">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#16092e] p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-fuchsia-500/20">
          <Music4 className="h-8 w-8 text-fuchsia-300" />
        </div>
        <h2 className="text-lg font-bold text-white">Enable music playback</h2>
        <p className="mt-2 text-sm text-white/60">
          Allow audio and notifications so songs play smoothly and you can
          control playback from your lock screen and notification shade.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <Music4 className="h-4 w-4" /> Audio
          </span>
          <span className="flex items-center gap-1.5">
            <Bell className="h-4 w-4" /> Notifications
          </span>
        </div>
        <button
          onClick={enable}
          className="mt-5 w-full rounded-full bg-fuchsia-500 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400"
        >
          Allow & continue
        </button>
        <button
          onClick={dismiss}
          className="mt-2 w-full rounded-full py-2 text-xs text-white/50 transition hover:text-white/80"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
