
import { toast } from "sonner";

let lastNotificationTime = 0;
const NOTIFICATION_COOLDOWN = 3000; // 3 seconds cooldown between notifications

export const showNotification = {
  nowPlaying: (title: string, artist: string) => {
    // Disabled - no more toast notifications for now playing
    return;
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
