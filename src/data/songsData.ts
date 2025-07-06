
export interface EnhancedSong {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  category: 'trending' | 'god' | 'sad' | 'love' | 'party' | 'workout' | 'chill' | 'devotional';
  mood: 'happy' | 'sad' | 'energetic' | 'peaceful' | 'romantic' | 'spiritual' | 'motivational';
  tags: string[];
}

export const enhancedSongs: EnhancedSong[] = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/blinding-lights.mp3",
    duration: 200,
    category: 'trending',
    mood: 'energetic',
    tags: ['pop', 'synth', 'dance', 'trending', 'popular']
  },
  {
    id: "2",
    title: "Someone Like You",
    artist: "Adele",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/someone-like-you.mp3",
    duration: 285,
    category: 'sad',
    mood: 'sad',
    tags: ['ballad', 'emotional', 'heartbreak', 'piano', 'sad']
  },
  {
    id: "3",
    title: "Perfect",
    artist: "Ed Sheeran",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/perfect.mp3",
    duration: 263,
    category: 'love',
    mood: 'romantic',
    tags: ['romantic', 'wedding', 'acoustic', 'love', 'guitar']
  },
  {
    id: "4",
    title: "Amazing Grace",
    artist: "Traditional",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/amazing-grace.mp3",
    duration: 240,
    category: 'god',
    mood: 'spiritual',
    tags: ['spiritual', 'hymn', 'worship', 'god', 'traditional']
  },
  {
    id: "5",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/uptown-funk.mp3",
    duration: 270,
    category: 'party',
    mood: 'energetic',
    tags: ['funk', 'party', 'dance', 'upbeat', 'fun']
  },
  {
    id: "6",
    title: "Eye of the Tiger",
    artist: "Survivor",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/eye-of-the-tiger.mp3",
    duration: 246,
    category: 'workout',
    mood: 'motivational',
    tags: ['rock', 'workout', 'motivation', 'energy', 'classic']
  },
  {
    id: "7",
    title: "Weightless",
    artist: "Marconi Union",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/weightless.mp3",
    duration: 485,
    category: 'chill',
    mood: 'peaceful',
    tags: ['ambient', 'relaxing', 'meditation', 'chill', 'peaceful']
  },
  {
    id: "8",
    title: "How Great Thou Art",
    artist: "Carrie Underwood",
    imageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/how-great-thou-art.mp3",
    duration: 290,
    category: 'devotional',
    mood: 'spiritual',
    tags: ['worship', 'hymn', 'devotional', 'god', 'praise']
  }
];

export const searchSongsByCategory = (category: string): EnhancedSong[] => {
  return enhancedSongs.filter(song => 
    song.category.toLowerCase().includes(category.toLowerCase()) ||
    song.mood.toLowerCase().includes(category.toLowerCase()) ||
    song.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
  );
};

export const searchSongsByQuery = (query: string): EnhancedSong[] => {
  const lowerQuery = query.toLowerCase();
  return enhancedSongs.filter(song =>
    song.title.toLowerCase().includes(lowerQuery) ||
    song.artist.toLowerCase().includes(lowerQuery) ||
    song.category.toLowerCase().includes(lowerQuery) ||
    song.mood.toLowerCase().includes(lowerQuery) ||
    song.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
