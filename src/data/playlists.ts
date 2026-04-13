
import { Song, songs } from "./songs";
import { moreSongs } from "./moreSongs";
import { massRapSongs } from "./massRapSongs";

const massRapSongsMap = new Map(massRapSongs.map(s => [s.id, s]));
const songsMap = new Map(songs.map(s => [s.id, s]));
const moreSongsMap = new Map(moreSongs.map(s => [s.id, s]));

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
      massRapSongsMap.get("Monica Telugu"),
      massRapSongsMap.get("Poratame"),
      massRapSongsMap.get("My Name is Billa"),
      massRapSongsMap.get("Ragile Ragile"),
      massRapSongsMap.get("Crazy Feeling"),
      massRapSongsMap.get("Viral Vayyari"),
      massRapSongsMap.get("Ticket Eh Konakunda"),
      massRapSongsMap.get("Kissik"),
      massRapSongsMap.get("collage papa"),
      massRapSongsMap.get("Oo Antava Oo Oo Antava"),
      massRapSongsMap.get("Radhika"),
      massRapSongsMap.get("Hungry Cheetah OG Glimpse"),
      massRapSongsMap.get("Salaam Rocky Bhai"),
      massRapSongsMap.get("Single Kingulam"),
      massRapSongsMap.get("Jaragandi"),
      massRapSongsMap.get("Ta Takkara Takka Takkara"),
      massRapSongsMap.get("Red Sea"),
      massRapSongsMap.get("peelings"),
      massRapSongsMap.get("Bujjikanna"),
      massRapSongsMap.get("Dammunte Pattukora"),
      massRapSongsMap.get("Kurchi Madathapetti"),
      massRapSongsMap.get("Ramana Aei"),
      massRapSongsMap.get("Ga Eega Eega Eega"),
      massRapSongsMap.get("Lucky Bhaskar (Title song)"),
      massRapSongsMap.get("Katamarayuda"),
      massRapSongsMap.get("Kirraaku"),
      massRapSongsMap.get("Rakaasi Rakaasi"),
      massRapSongsMap.get("Paala Pitta"),
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
      songsMap.get("Hridayam Lopala"),
      songsMap.get("Poolamme Pilla"),
      songsMap.get("Godari Gattu"),
      songsMap.get("Nuvvu Navvukuntu"),
      songsMap.get("Chukkala Chunni"),
      songsMap.get("Suttamla Soosi"),
      songsMap.get("Yedhee"),
      songsMap.get("Bala Tripuramani"),
      songsMap.get("Prema Velluva"),
      songsMap.get("Chandruloo Unde"),
      songsMap.get("Meenu"),
      songsMap.get("Adhento Gaani Vunnapaatuga"),
      songsMap.get("Anuvanuvuu"),
      songsMap.get("Golden Sparrow"),
      songsMap.get("Kanulu Chadire"),
      songsMap.get("Yedurangula Vaana"),
      songsMap.get("Hey Rangule"),
      songsMap.get("Yemito"),
      songsMap.get("Chuttamalle"),
      songsMap.get("Kumkumala"),
      songsMap.get("pilla Padesaave"),
      songsMap.get("Oh Pilla"),
      songsMap.get("ye Kannuulu Chudani Chitrame"),
      songsMap.get("Kollagotte"),
      songsMap.get("Kalyani Vaccha Vacchaa"),
      songsMap.get("Choosi Chudangane"),
      songsMap.get("Premalo"),
      songsMap.get("Inthalo Ennenni Vinthalo"),
      songsMap.get("Inthandam")
    ].filter(Boolean) as Song[],
    createdBy: "ROI",
    createdAt: "2024-05-15"
  },
  {
    id: "playlist3",
    title: "Break!,Sad,Alone,Mood MIX",
    description: "Enjoy and Entertainment the platform. ROI",
    coverImage: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755419378/IMG_20250817_135835_dwga28.jpg",
    songs: [
      moreSongsMap.get("Mawaa Enthaina"),
      moreSongsMap.get("Varinche Prema"),
      moreSongsMap.get("Thanu"),
      moreSongsMap.get("Mari Antaga"),
      moreSongsMap.get("Ayyayyo Sad"),
      moreSongsMap.get("Katha Kaadhey"),
      moreSongsMap.get("Why This Kolaveri Di"),
      moreSongsMap.get("Po Ve Po Remix"),
      moreSongsMap.get("Sailaja Sailaja"),
      moreSongsMap.get("Pranam pothunna"),
      moreSongsMap.get("A Life Full Of Love"),
      moreSongsMap.get("Uppenantha"),
      moreSongsMap.get("Pillaa Raa"),
      moreSongsMap.get("Megham Karigena"),
      moreSongsMap.get("Life of Pandu From Thiru"),
      moreSongsMap.get("Evarevaro"),
      moreSongsMap.get("My Love Is Gone")
    ].filter(Boolean) as Song[],
    createdBy: "ROI",
    createdAt: "2024-05-15"
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
  "Mass & Rap": [playlists[0]],
  "Romance": [playlists[1]],
  "Mood Mix": [playlists[2]]
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
