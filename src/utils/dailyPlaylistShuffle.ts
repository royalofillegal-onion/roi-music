import { Song } from "@/data/songs";
import { songs } from "@/data/songs";
import { moreSongs } from "@/data/moreSongs";
import { trendingSongs } from "@/data/trendingSongs";
import { massRapSongs } from "@/data/massRapSongs";

// Combine all songs for filtering
const allSongsForPlaylists = [...songs, ...moreSongs, ...trendingSongs, ...massRapSongs];

// Seeded random for daily consistency
const getDailySeed = () => {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

const seededShuffle = <T>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  let currentSeed = seed;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Get songs by sync category
export const getSongsBySync = (syncTypes: string[]): Song[] => {
  return allSongsForPlaylists.filter(song => 
    song.sync && syncTypes.includes(song.sync.toLowerCase())
  );
};

// Daily shuffled playlists by sync category
export const getDailyShuffledPlaylist = (syncTypes: string[], limit: number = 20): Song[] => {
  const songs = getSongsBySync(syncTypes);
  const seed = getDailySeed();
  const shuffled = seededShuffle(songs, seed);
  return shuffled.slice(0, limit);
};

// Featured playlist definitions
export interface FeaturedPlaylist {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  syncTypes: string[];
  songs: Song[];
}

export const getFeaturedPlaylists = (): FeaturedPlaylist[] => {
  const seed = getDailySeed();
  
  return [
    {
      id: 'romantic-nights',
      title: 'Romantic Nights',
      description: 'Love songs for special moments',
      coverImage: 'https://res.cloudinary.com/dilqrz7sw/image/upload/v1755409239/IMG_20250817_110726_bvqjm4.jpg',
      syncTypes: ['romantic', 'love'],
      songs: seededShuffle(getSongsBySync(['romantic', 'love']), seed).slice(0, 25)
    },
    {
      id: 'heartbreak-corner',
      title: 'Heartbreak & Breakup',
      description: 'Songs for when you need to feel',
      coverImage: 'https://res.cloudinary.com/dilqrz7sw/image/upload/v1755419378/IMG_20250817_135835_dwga28.jpg',
      syncTypes: ['sad', 'break', 'breakup'],
      songs: seededShuffle(getSongsBySync(['sad', 'break', 'breakup', 'Sad']), seed).slice(0, 25)
    },
    {
      id: 'mass-energy',
      title: 'Mass Energy',
      description: 'High energy mass and action beats',
      coverImage: 'https://res.cloudinary.com/dilqrz7sw/image/upload/v1755407520/ChatGPT_Image_Aug_17_2025_10_38_24_AM_nyhydg.png',
      syncTypes: ['mass', 'action', 'rap'],
      songs: seededShuffle(getSongsBySync(['mass', 'action', 'rap', 'Rap']), seed).slice(0, 25)
    },
    {
      id: 'feel-vibes',
      title: 'Feel Vibes',
      description: 'Deep emotional songs to touch your heart',
      coverImage: 'https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/Kubera-Telugu-2024-20241117001625-500x500_wufd8d.jpg',
      syncTypes: ['feel1', 'feel'],
      songs: seededShuffle(getSongsBySync(['feel1', 'feel']), seed).slice(0, 25)
    },
    {
      id: 'happy-vibes',
      title: 'Happy Vibes',
      description: 'Uplifting songs to brighten your day',
      coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop',
      syncTypes: ['happy', 'good'],
      songs: seededShuffle(getSongsBySync(['happy', 'good']), seed).slice(0, 25)
    },
    {
      id: 'devotional-peace',
      title: 'Devotional Peace',
      description: 'Spiritual and devotional melodies',
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
      syncTypes: ['devotional'],
      songs: seededShuffle(getSongsBySync(['devotional']), seed).slice(0, 20)
    },
    {
      id: 'folk-roots',
      title: 'Folk Roots',
      description: 'Traditional folk melodies',
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop',
      syncTypes: ['folk'],
      songs: seededShuffle(getSongsBySync(['folk']), seed).slice(0, 20)
    }
  ].filter(playlist => playlist.songs.length > 0);
};

// Get all unique sync types from songs
export const getAllSyncTypes = (): string[] => {
  const syncTypes = new Set<string>();
  allSongsForPlaylists.forEach(song => {
    if (song.sync) {
      syncTypes.add(song.sync);
    }
  });
  return Array.from(syncTypes);
};
