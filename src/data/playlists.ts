
import { Song, songs } from "./songs";
import { moreSongs } from "./moreSongs";
import { allSongs } from "./allSongs";
import { additionalSongs } from "./additionalSongs";
import { trendingSongs } from "./trendingSongs";

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  songs: Song[];
  createdBy: string;
  createdAt: string;
}

export const playlists: Playlist[] = [
  {
    id: "playlist1",
    title: "444",
    description: ".....",
    coverImage: "https://res.cloudinary.com/dd6xwej67/image/upload/v1755049414/Screenshot_2025-08-13_071302_myenzb.png",
    songs: [songs[1], songs[4], trendingSongs[1]],
    createdBy: "RoyalStar",
    createdAt: "2024-05-15"
  },
  {
    id: "playlist2",
    title: "444",
    description: "??",
    coverImage: "https://res.cloudinary.com/dd6xwej67/image/upload/v1755049414/Screenshot_2025-08-13_071302_myenzb.png",
    songs: [],
    createdBy: "RoyalStar",
    createdAt: "2023-05-10"
  },
  {
    id: "playlist3",
    title: "444",
    description: "???",
    coverImage: "https://res.cloudinary.com/dd6xwej67/image/upload/v1755049414/Screenshot_2025-08-13_071302_myenzb.png",
    songs: [],
    createdBy: "RoyalStar",
    createdAt: "2023-06-22"
  },
  {
    id: "playlist4",
    title: "444",
    description: "....",
    coverImage: "https://res.cloudinary.com/dd6xwej67/image/upload/v1755049414/Screenshot_2025-08-13_071302_myenzb.png",
    songs: [],
    createdBy: "RoyalStar",
    createdAt: "2023-07-05"
  },
  {
    id: "playlist5",
    title: "444",
    description: "...",
    coverImage: "https://res.cloudinary.com/dd6xwej67/image/upload/v1755049414/Screenshot_2025-08-13_071302_myenzb.png",
    songs: [],
    createdBy: "RoyalStar",
    createdAt: "2023-08-18"
  }
];

// Create a playlists by genre mapping
export const playlistsByGenre = {
  "Electronic": [playlists[0], playlists[3]],
  "Workout": [playlists[1]],
  "Focus": [playlists[2]],
  "Driving": [playlists[3]],
  "Morning": [playlists[4]]
};

// Function to get user playlists from localStorage or create new ones
export const getUserPlaylists = (): Playlist[] => {
  const storedPlaylists = localStorage.getItem("userPlaylists");
  if (storedPlaylists) {
    try {
      return JSON.parse(storedPlaylists);
    } catch (e) {
      console.error("Error parsing user playlists", e);
    }
  }
  return [];
};

// Function to save user playlists to localStorage
export const saveUserPlaylists = (playlists: Playlist[]) => {
  localStorage.setItem("userPlaylists", JSON.stringify(playlists));
};

// Function to create a new user playlist
export const createPlaylist = (title: string, description: string = "", coverImage: string = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop"): Playlist => {
  const newPlaylist: Playlist = {
    id: `user-playlist-${Date.now()}`,
    title,
    description,
    coverImage,
    songs: [],
    createdBy: "User",
    createdAt: new Date().toISOString()
  };
  
  const userPlaylists = getUserPlaylists();
  userPlaylists.push(newPlaylist);
  saveUserPlaylists(userPlaylists);
  
  return newPlaylist;
};

// Function to add a song to a user playlist
export const addSongToPlaylist = (playlistId: string, song: Song): boolean => {
  const userPlaylists = getUserPlaylists();
  const playlistIndex = userPlaylists.findIndex(p => p.id === playlistId);
  
  if (playlistIndex === -1) return false;
  
  // Check if song is already in playlist
  if (!userPlaylists[playlistIndex].songs.some(s => s.id === song.id)) {
    userPlaylists[playlistIndex].songs.push(song);
    saveUserPlaylists(userPlaylists);
  }
  
  return true;
};
