// Owner/Artist detailed information for the Now Playing page

export interface SongDescription {
  songId: string;
  description: string;
  lyrics?: string;
  mood?: string;
  language?: string;
  composer?: string;
  lyricist?: string;
  producer?: string;
}

export interface OwnerDetails {
  id: number;
  name: string;
  artistname:string;
  image: string;
  bio: string;
  genres: string[];
  totalSongs: number;
  sponsors: string[];
  topSongs: string[];
  yearsActive: string;
  awards: string[];
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  linkedSongIds: string[]; // Songs linked to this owner
}

// Sample owner data
export const ownerDetails: OwnerDetails[] = [
  {
    id: 1,
    name: "Andhra King Taluka",
    artistname:"NA",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face",
    bio: "Rising Telugu music sensation known for energetic beats and soulful melodies. Pioneer of modern Telugu hip-hop with a unique blend of traditional and contemporary sounds.",
    genres: ["Telugu Hip-Hop", "Folk Fusion", "Mass Music"],
    totalSongs: 45,
    sponsors: ["ROI Music", "Aditya Music", "Mango Music"],
    topSongs: ["Chinni Gundelo", "Mass Anthem", "Andhra Pride"],
    yearsActive: "2020-Present",
    awards: ["Best New Artist 2021", "Viral Song Award 2022", "Mass Icon 2023"],
    socialLinks: {
      instagram: "@andhrakingtaluka",
      youtube: "AndhraKingTalukaOfficial",
      twitter: "@aktofficial"
    },
    linkedSongIds: ["chinni-gundelo", "song-1", "song-2"]
  },
  {
    id: 2,
    name: "S. P. Balasubrahmanyam",
    artistname: "SPB",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop&crop=face",
    bio: "Legendary playback singer known as SPB, recorded over 40,000 songs in 16 languages. Recipient of Padma Shri, Padma Bhushan, and 6 National Film Awards.",
    genres: ["Playback", "Classical", "Film Music"],
    totalSongs: 40000,
    sponsors: ["Saregama", "Sony Music South", "Aditya Music"],
    topSongs: ["Sankarabharanam", "Sagara Sangamam", "Swathi Muthyam"],
    yearsActive: "1966-2020",
    awards: ["Padma Bhushan", "6 National Awards", "25 State Awards"],
    linkedSongIds: ["spb-classic-1", "spb-melody-2"]
  },
  {
    id: 3,
    name: "Peddi",
    artistname: "Peddi",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop&crop=face",
    bio: "Underground Telugu rapper making waves in the indie music scene. Known for hard-hitting lyrics and authentic street vibes.",
    genres: ["Telugu Rap", "Underground", "Street Music"],
    totalSongs: 28,
    sponsors: ["ROI Music", "Independent"],
    topSongs: ["Street Tales", "Naa Ganam", "Real Talk"],
    yearsActive: "2019-Present",
    awards: ["Underground Artist of the Year 2022"],
    linkedSongIds: ["peddi-1", "peddi-2"]
  },
  {
    id: 4,
    name: "Dude",
    artistname: "Dude",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "Versatile artist known for genre-bending compositions. Creates music that bridges traditional Telugu sounds with modern electronic elements.",
    genres: ["Electronic", "Pop", "Fusion"],
    totalSongs: 35,
    sponsors: ["ROI Music", "T-Series Telugu"],
    topSongs: ["Vibe Check", "Telugu Beats", "Modern Classic"],
    yearsActive: "2018-Present",
    awards: ["Innovation in Music 2023"],
    linkedSongIds: ["dude-1", "dude-2"]
  },
  {
    id: 5,
    name: "OG",
    artistname: "OG",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&crop=face",
    bio: "The original gangster of Telugu rap scene. Pioneered the movement and continues to inspire new generation artists.",
    genres: ["Telugu Rap", "Hip-Hop", "Trap"],
    totalSongs: 52,
    sponsors: ["ROI Music", "Def Jam India"],
    topSongs: ["OG Anthem", "Legend Status", "Telugu Swag"],
    yearsActive: "2015-Present",
    awards: ["Rap Pioneer Award", "Icon of the Decade"],
    linkedSongIds: ["og-1", "og-2", "og-3"]
  }
];

// Sample song descriptions
export const songDescriptions: SongDescription[] = [
  {
    songId: "chinni-gundelo",
    description: "A melodious love song that captures the essence of first love. The track features traditional instruments blended with modern beats, creating a perfect fusion of old and new.",
    mood: "Romantic",
    language: "Telugu",
    composer: "Andhra King Taluka",
    lyricist: "Sirivennela Seetharama Sastry",
    producer: "ROI Music Productions"
  },
  {
    songId: "song-1",
    description: "An energetic anthem that celebrates the spirit of Andhra Pradesh. High-tempo beats with powerful lyrics that resonate with the youth.",
    mood: "Energetic",
    language: "Telugu",
    composer: "Andhra King Taluka",
    lyricist: "Chandrabose",
    producer: "ROI Music Productions"
  },
  {
    songId: "song-2",
    description: "A soulful ballad about life's journey and the pursuit of dreams. Features acoustic guitar and gentle percussion.",
    mood: "Inspirational",
    language: "Telugu",
    composer: "Andhra King Taluka",
    lyricist: "Ramajogayya Sastry",
    producer: "Aditya Music"
  },
  {
    songId: "song-3",
    description: "Dance number with catchy hooks and infectious rhythm. Perfect for celebrations and parties.",
    mood: "Party",
    language: "Telugu",
    composer: "Andhra King Taluka",
    lyricist: "Bhaskarabhatla",
    producer: "Mango Music"
  }
];

// Get owner by artist name (case-insensitive match)
export const getOwnerByArtistName = (artistName: string): OwnerDetails | undefined => {
  return ownerDetails.find(
    owner => owner.name.toLowerCase() === artistName.toLowerCase()
  );
};

// Get owner by song ID
export const getOwnerBySongId = (songId: string): OwnerDetails | undefined => {
  return ownerDetails.find(owner => owner.linkedSongIds.includes(songId));
};

// Get song description by ID
export const getSongDescription = (songId: string): SongDescription | undefined => {
  return songDescriptions.find(desc => desc.songId === songId);
};

// Generate a default song description if none exists
export const getOrGenerateSongDescription = (songId: string, songTitle: string, artistName: string): SongDescription => {
  const existing = getSongDescription(songId);
  if (existing) return existing;
  
  // Generate default description
  return {
    songId,
    description: `"${songTitle}" is a captivating track by ${artistName}. This song showcases the artist's unique style and musical prowess, delivering an unforgettable listening experience.`,
    mood: "Various",
    language: "Telugu",
    composer: artistName,
    lyricist: "Various Artists",
    producer: "ROI Music"
  };
};
