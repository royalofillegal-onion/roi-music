
import { Song, songs } from "./songs";

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
    title: "Chill the vibe",
    description: "Perfect for relaxing and unwinding",
    coverImage: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747285370/0x1900-000000-80-0-0_gpphvv.jpg",
    songs: [songs[1], songs[4], songs[7], songs[9], songs[12]],
    createdBy: "RoyalStar",
    createdAt: "2024-05-15"
  },
  {
    id: "playlist2",
    title: "Workout Mix",
    description: "High energy tracks to keep you motivated",
    coverImage: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=500&auto=format&fit=crop",
    songs: [songs[0], songs[3], songs[5], songs[8], songs[10]],
    createdBy: "RoyalStar",
    createdAt: "2023-05-10"
  },
  {
    id: "playlist3",
    title: "Focus Flow",
    description: "Concentration and productivity enhancement",
    coverImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=500&auto=format&fit=crop",
    songs: [songs[2], songs[4], songs[6], songs[13], songs[14]],
    createdBy: "RoyalStar",
    createdAt: "2023-06-22"
  },
  {
    id: "playlist4",
    title: "Late Night Drive",
    description: "Smooth tracks for your nighttime journey",
    coverImage: "https://images.unsplash.com/photo-1551710029-607e06bd45ff?q=80&w=500&auto=format&fit=crop",
    songs: [songs[3], songs[8], songs[11], songs[0], songs[7]],
    createdBy: "RoyalStar",
    createdAt: "2023-07-05"
  },
  {
    id: "playlist5",
    title: "Morning Coffee",
    description: "Start your day right with these uplifting beats",
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500&auto=format&fit=crop",
    songs: [songs[9], songs[5], songs[2], songs[14], songs[1]],
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
