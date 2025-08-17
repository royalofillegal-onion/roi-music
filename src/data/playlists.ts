
import { Song, songs } from "./songs";
import { moreSongs } from "./moreSongs";
import { allSongs } from "./allSongs";
import { additionalSongs } from "./additionalSongs";
import { trendingSongs } from "./trendingSongs";
import { massRapSongs } from "./massRapSongs";

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
    title: "MASS & Rap! 1",
    description: "Enjoy and Entertainment the platform. ROI",
    coverImage: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755407520/ChatGPT_Image_Aug_17_2025_10_38_24_AM_nyhydg.png ",
    songs: [
      massRapSongs.find(s => s.id === "Monica Telugu"),
      massRapSongs.find(s => s.id === "Poratame"), 
      massRapSongs.find(s => s.id === "My Name is Billa"),
      massRapSongs.find(s => s.id === "Ragile Ragile"),
      massRapSongs.find(s => s.id === "Crazy Feeling"),
      massRapSongs.find(s => s.id === "Viral Vayyari"),
      massRapSongs.find(s => s.id === "Ticket Eh Konakunda"),
      massRapSongs.find(s => s.id === "Kissik"),
      massRapSongs.find(s => s.id === "collage papa"),
      massRapSongs.find(s => s.id === "Oo Antava Oo Oo Antava"),
      massRapSongs.find(s => s.id === "Radhika"),
      massRapSongs.find(s => s.id === "Hungry Cheetah OG Glimpse"),
      massRapSongs.find(s => s.id === "Salaam Rocky Bhai"),
      massRapSongs.find(s => s.id === "Single Kingulam"),
      massRapSongs.find(s => s.id === "Jaragandi"),
      massRapSongs.find(s => s.id === "Ta Takkara Takka Takkara"),
      massRapSongs.find(s => s.id === "Red Sea"),
      massRapSongs.find(s => s.id === "peelings"),
      massRapSongs.find(s => s.id === "Bujjikanna"),
      massRapSongs.find(s => s.id === "Dammunte Pattukora"),
      massRapSongs.find(s => s.id === "Kurchi Madathapetti"),
      massRapSongs.find(s => s.id === "Ramana Aei"),
      massRapSongs.find(s => s.id === "Ga Eega Eega Eega"),
      massRapSongs.find(s => s.id === "Lucky Bhaskar (Title song)"),
      massRapSongs.find(s => s.id === "Katamarayuda"),
      massRapSongs.find(s => s.id === "Kirraaku"),
      massRapSongs.find(s => s.id === "Rakaasi Rakaasi"),
      massRapSongs.find(s => s.id === "Paala Pitta"),
    ].filter(Boolean) as Song[],
    createdBy: "ROI",
    createdAt: "2025-8-17"
  },
  {
    id: "playlist2",
    title: "Romantic<Love-1",
    description: "Enjoy and Entertainment the platform. ROI",
    coverImage: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755409239/IMG_20250817_110726_bvqjm4.jpg ",
    songs: [
      songs.find(s => s.id === "Hridayam Lopala"),
      songs.find(s => s.id === "Poolamme Pilla"), 
      songs.find(s => s.id === "Godari Gattu"),
      songs.find(s => s.id === "Nuvvu Navvukuntu"),
      songs.find(s => s.id === "Chukkala Chunni"),
      songs.find(s => s.id === "Suttamla Soosi"), 
      songs.find(s => s.id === "Yedhee"),
      songs.find(s => s.id === "Bala Tripuramani"),
      songs.find(s => s.id === "Prema Velluva"),
      songs.find(s => s.id === "Chandruloo Unde"), 
      songs.find(s => s.id === "Meenu"),
      songs.find(s => s.id === "Adhento Gaani Vunnapaatuga"),
      songs.find(s => s.id === "Anuvanuvuu"),
      songs.find(s => s.id === "Golden Sparrow"), 
      songs.find(s => s.id === "Kanulu Chadire"),
      songs.find(s => s.id === "Yedurangula Vaana"),
      songs.find(s => s.id === "Hey Rangule"),
      songs.find(s => s.id === "Yemito"), 
      songs.find(s => s.id === "Chuttamalle"),
      songs.find(s => s.id === "Kumkumala"),
      songs.find(s => s.id === "pilla Padesaave"),
      songs.find(s => s.id === "Oh Pilla"), 
      songs.find(s => s.id === "ye Kannuulu Chudani Chitrame"),
      songs.find(s => s.id === "Kollagotte"),
      songs.find(s => s.id === "Kalyani Vaccha Vacchaa"),
      songs.find(s => s.id === "Choosi Chudangane"), 
      songs.find(s => s.id === "Premalo"),
      songs.find(s => s.id === "Inthalo Ennenni Vinthalo"),
      songs.find(s => s.id === "Inthandam")
    ].filter(Boolean) as Song[],
    createdBy: "ROI",
    createdAt: "2024-05-15"
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

// Function to add a song to a user playlist by ID or title
export const addSongToPlaylist = (playlistId: string, song: Song): boolean => {
  const userPlaylists = getUserPlaylists();
  const playlistIndex = userPlaylists.findIndex(p => p.id === playlistId || p.title === playlistId);
  
  if (playlistIndex === -1) return false;
  
  // Check if song is already in playlist (by ID or title)
  const songExists = userPlaylists[playlistIndex].songs.some(s => 
    s.id === song.id || s.title === song.title
  );
  
  if (!songExists) {
    userPlaylists[playlistIndex].songs.push(song);
    saveUserPlaylists(userPlaylists);
  }
  
  return true;
};

// Function to generate shareable playlist link
export const generatePlaylistShareLink = (playlistId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared-playlist/${playlistId}`;
};

// Function to get playlist by ID or title
export const getPlaylistByIdOrTitle = (identifier: string): Playlist | null => {
  const userPlaylists = getUserPlaylists();
  const allPlaylists = [...playlists, ...userPlaylists];
  
  return allPlaylists.find(p => p.id === identifier || p.title === identifier) || null;
};
