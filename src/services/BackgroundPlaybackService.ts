/**
 * Background playback + notification service.
 *
 * Browsers with the Media Session API (Chrome Android, desktop Chrome, iOS
 * Safari) already show the system "media notification" with play/pause/skip
 * controls — PlayerContext wires that up. This service covers everything else:
 *
 * 1. Asks for notification permission at the right moment (the first play
 *    tap), never at page load where browsers silently ignore the prompt.
 * 2. Posts a "Now playing" system notification when the app is backgrounded
 *    on browsers that do NOT show a media notification themselves
 *    (e.g. Android WebView / custom wrappers, Firefox).
 * 3. Taps on the notification bring the app back to the foreground.
 */

export interface NowPlayingPayload {
  title: string;
  artist: string;
  imageUrl?: string;
}

class BackgroundPlaybackService {
  private permissionAsked = false;
  private notification: Notification | null = null;
  private lastKey = "";

  /** Call from a user gesture (first play tap) — permission prompts outside a gesture are ignored. */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) return "denied";
    if (Notification.permission !== "default") return Notification.permission;
    if (this.permissionAsked) return Notification.permission;
    this.permissionAsked = true;
    try {
      return await Notification.requestPermission();
    } catch {
      return "denied";
    }
  }

  get permission(): NotificationPermission {
    if (!("Notification" in window)) return "denied";
    return Notification.permission;
  }

  /**
   * Show / refresh the background "Now playing" notification.
   * No-op while the app is visible (the in-app player + system media
   * notification already cover that) and no-op when permission is missing.
   */
  showNowPlaying(song: NowPlayingPayload): void {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (!document.hidden) {
      this.close();
      return;
    }
    // Browsers with Media Session render their own richer media notification;
    // posting a second one would just duplicate it in the shade.
    if ("mediaSession" in navigator) return;

    const key = `${song.title}::${song.artist}`;
    if (key === this.lastKey && this.notification) return;
    this.lastKey = key;

    try {
      this.notification?.close();
      const n = new Notification("♪ ROI Music — Now playing", {
        body: `${song.title} — ${song.artist}`,
        icon: song.imageUrl || "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "roi-now-playing",
        silent: true,
        requireInteraction: false,
      });
      n.onclick = () => {
        try { window.focus(); } catch { /* ignore */ }
        n.close();
      };
      this.notification = n;
    } catch {
      // Some engines only allow notifications from a service worker — ignore.
    }
  }

  close(): void {
    try {
      this.notification?.close();
    } catch { /* ignore */ }
    this.notification = null;
  }
}

export const backgroundPlayback = new BackgroundPlaybackService();
