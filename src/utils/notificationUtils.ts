
import { toast } from 'sonner';

// Enhanced notification system with better UX
export const showNotification = {
  // Success notifications
  nowPlaying: (title: string, artist: string) => {
    toast.success(`♪ Now Playing: ${title}`, {
      description: `by ${artist}`,
      duration: 3000,
      style: {
        background: '#1f2937',
        border: '1px solid #374151',
        color: '#fff',
      },
    });
  },

  songLiked: (title: string) => {
    toast.success(`❤️ Added to favorites`, {
      description: title,
      duration: 2000,
      style: {
        background: '#1f2937',
        border: '1px solid #374151',
        color: '#fff',
      },
    });
  },

  playlistCreated: (name: string) => {
    toast.success(`🎵 Playlist created: ${name}`, {
      duration: 2000,
      style: {
        background: '#1f2937',
        border: '1px solid #374151',
        color: '#fff',
      },
    });
  },

  // Info notifications
  shuffleMode: () => {
    toast.info('🔀 Shuffle mode activated', {
      duration: 2000,
      style: {
        background: '#1f2937',
        border: '1px solid #374151',
        color: '#fff',
      },
    });
  },

  // Suppress error notifications that are not critical
  suppressError: (message: string) => {
    // Only log to console, don't show toast
    console.log('Suppressed notification:', message);
  },

  // Only show critical errors
  criticalError: (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: '#1f2937',
        border: '1px solid #ef4444',
        color: '#fff',
      },
    });
  }
};
