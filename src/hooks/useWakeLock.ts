import { useEffect, useRef } from "react";

/**
 * Keeps the device awake while audio is playing so playback continues
 * smoothly even when the screen turns off (web / PWA best-effort).
 *
 * NOTE: A real "survive app removal" foreground service is native-only and
 * must be implemented in the Capacitor Android layer (see
 * native-overlay-foreground.md). This hook covers the web/PWA case.
 */
export function useWakeLock(active: boolean) {
  const lockRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const request = async () => {
      try {
        const nav = navigator as any;
        if (active && "wakeLock" in navigator && document.visibilityState === "visible") {
          lockRef.current = await nav.wakeLock.request("screen");
          lockRef.current?.addEventListener?.("release", () => {
            lockRef.current = null;
          });
        }
      } catch {
        /* wake lock denied or unsupported — audio still plays */
      }
    };

    const release = async () => {
      try {
        await lockRef.current?.release?.();
      } catch {
        /* ignore */
      }
      lockRef.current = null;
    };

    if (active) request();
    else release();

    // Re-acquire when the page becomes visible again (locks drop on hide).
    const onVisible = () => {
      if (!cancelled && active && document.visibilityState === "visible" && !lockRef.current) {
        request();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      release();
    };
  }, [active]);
}
