
import { toast } from "sonner";

let lastNotificationTime = 0;
const NOTIFICATION_COOLDOWN = 3000; // 3 seconds cooldown between notifications

export const showNotification = {
  nowPlaying: (title: string, artist: string) => {
    const now = Date.now();
    // Only show notification if enough time has passed since last one
    if (now - lastNotificationTime > NOTIFICATION_COOLDOWN) {
      toast(
        `${title} - ${artist}`,
        {
          duration: 1500, // Show for only 1.5 seconds (much shorter)
          position: "bottom-right",
          className: "bg-gray-800 text-white border-music-accent/30",
          icon: "🎵",
        }
      );
      lastNotificationTime = now;
    }
  },
  
  shuffleMode: () => {
    const now = Date.now();
    if (now - lastNotificationTime > NOTIFICATION_COOLDOWN) {
      toast("Shuffle mode activated", {
        duration: 1000, // Very short duration
        position: "bottom-right",
        className: "bg-gray-800 text-white border-music-accent/30",
        icon: "🔀",
      });
      lastNotificationTime = now;
    }
  },

  songLiked: (title: string) => {
    toast(`Added "${title}" to liked songs`, {
      duration: 1200,
      position: "bottom-right",
      className: "bg-gray-800 text-white border-green-500/30",
      icon: "❤️",
    });
  },

  songUnliked: (title: string) => {
    toast(`Removed "${title}" from liked songs`, {
      duration: 1200,
      position: "bottom-right",
      className: "bg-gray-800 text-white border-red-500/30",
      icon: "💔",
    });
  }
};
