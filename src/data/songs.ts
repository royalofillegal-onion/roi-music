
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  category?: string;
  mood?: string;
  tags?: string[];
}

export const songs: Song[] = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1036.mp3",
    duration: 200,
    category: "party",
    mood: "energetic",
    tags: ["pop", "upbeat", "dance"]
  },
  {
    id: "2",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1037.mp3",
    duration: 174,
    category: "chill",
    mood: "happy",
    tags: ["pop", "summer", "feel-good"]
  },
  {
    id: "3",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1038.mp3",
    duration: 203,
    category: "party",
    mood: "energetic",
    tags: ["pop", "dance", "disco"]
  },
  {
    id: "4",
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    genre: "Pop Rock",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1039.mp3",
    duration: 178,
    category: "workout",
    mood: "energetic",
    tags: ["pop-rock", "angry", "breakup"]
  },
  {
    id: "5",
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    album: "F*CK LOVE 3",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1040.mp3",
    duration: 141,
    category: "love",
    mood: "romantic",
    tags: ["pop", "love", "collaboration"]
  }
];

export const trendingSongs: Song[] = [
  {
    id: "trend-1",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1041.mp3",
    duration: 167,
    category: "trending",
    mood: "nostalgic",
    tags: ["pop", "indie", "trending"]
  },
  {
    id: "trend-2",
    title: "Heat Waves",
    artist: "Glass Animals",
    album: "Dreamland",
    genre: "Indie Pop",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1042.mp3",
    duration: 238,
    category: "chill",
    mood: "dreamy",
    tags: ["indie", "chill", "viral"]
  },
  {
    id: "trend-3",
    title: "Industry Baby",
    artist: "Lil Nas X ft. Jack Harlow",
    album: "MONTERO",
    genre: "Hip Hop",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1043.mp3",
    duration: 212,
    category: "party",
    mood: "confident",
    tags: ["hip-hop", "party", "collaboration"]
  }
];

export const popularSongs: Song[] = [
  {
    id: "pop-1",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1044.mp3",
    duration: 233,
    category: "party",
    mood: "upbeat",
    tags: ["pop", "dance", "catchy"]
  },
  {
    id: "pop-2",
    title: "Someone Like You",
    artist: "Adele",
    album: "21",
    genre: "Pop Ballad",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1045.mp3",
    duration: 284,
    category: "sad",
    mood: "melancholic",
    tags: ["ballad", "heartbreak", "emotional"]
  },
  {
    id: "pop-3",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    genre: "Rock",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1046.mp3",
    duration: 355,
    category: "classic",
    mood: "epic",
    tags: ["rock", "classic", "opera"]
  }
];

export const newReleases: Song[] = [
  {
    id: "new-1",
    title: "Flowers",
    artist: "Miley Cyrus",
    album: "Endless Summer Vacation",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1047.mp3",
    duration: 200,
    category: "new",
    mood: "empowering",
    tags: ["pop", "empowerment", "new"]
  },
  {
    id: "new-2",
    title: "Unholy",
    artist: "Sam Smith ft. Kim Petras",
    album: "Single",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1048.mp3",
    duration: 156,
    category: "party",
    mood: "dark",
    tags: ["pop", "dark", "collaboration"]
  },
  {
    id: "new-3",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    album: "Midnights",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1049.mp3",
    duration: 201,
    category: "introspective",
    mood: "reflective",
    tags: ["pop", "introspective", "storytelling"]
  }
];
