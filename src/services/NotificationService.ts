// In-app DOM notification overlay removed in favor of native Media Session
// (lock-screen / system tray) controls handled by MediaSessionService.
// These exports are kept as no-ops for backwards compatibility with callers.

export interface SongNotificationData {
  title: string;
  artist: string;
  imageUrl?: string;
  id: string;
  duration?: number;
}

export const showSongNotification = (
  _title: string,
  _artist: string,
  _imageUrl?: string,
  _songId?: string,
  _duration?: number
) => {
  // Intentionally no-op. System lock-screen controls are handled by MediaSessionService.
};

export const preNotifyNextSong = (
  _title: string,
  _artist: string,
  _imageUrl?: string,
  _songId?: string
) => {};

export const supportsContinuousPlayback = (): boolean => {
  return typeof navigator !== "undefined" && "mediaSession" in navigator;
};

export const signalSongEnding = (_nextSong: SongNotificationData) => {};
export const signalSongTransition = (_currentSongId: string, _nextSongId: string) => {};
export const forceNextSong = () => {};
export const cancelNotifications = () => {};
