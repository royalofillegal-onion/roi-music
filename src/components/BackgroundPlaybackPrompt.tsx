import { useEffect, useState } from "react";
import { BatteryCharging, X, Check } from "lucide-react";

const KEY = "roi:bg-playback-consent";

/**
 * Asks the user to allow background playback (notifications + screen wake lock)
 * and explains how to exempt the app from Android battery optimisation.
 */
export function BackgroundPlaybackPrompt() {
  const [open, setOpen] = useState(false);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KEY)) return;
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const allow = async () => {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch {
      /* ignore */
    }
    try {
      // Keeps playback alive while the tab is visible on some Android browsers.
      await (navigator as any).wakeLock?.request?.("screen");
    } catch {
      /* ignore */
    }
    localStorage.setItem(KEY, "allowed");
    setGranted(true);
    setTimeout(() => setOpen(false), 1400);
  };

  const dismiss = () => {
    localStorage.setItem(KEY, "dismissed");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] flex justify-center p-4 pb-24">
      <div className="w-full max-w-md rounded-[28px] border border-red-900/50 bg-black/90 p-5 shadow-[0_30px_90px_-20px_rgba(220,38,38,0.5)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-red-800/60 bg-red-950/50">
            <BatteryCharging className="h-5 w-5 text-red-500" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white">Keep music playing in the background</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Allow notifications so you get lock-screen controls. On Android, also set
              battery usage for this app to <span className="text-zinc-200">Unrestricted</span> so
              playback never stops when the screen turns off.
            </p>
          </div>
          <button onClick={dismiss} aria-label="Dismiss" className="text-zinc-500 active:scale-90">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={dismiss}
            className="flex-1 rounded-full border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-zinc-300 active:scale-95"
          >
            Not now
          </button>
          <button
            onClick={allow}
            className="flex-1 rounded-full bg-red-600 py-2.5 text-xs font-bold text-white transition active:scale-95"
          >
            {granted ? (
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Enabled
              </span>
            ) : (
              "Allow background play"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
