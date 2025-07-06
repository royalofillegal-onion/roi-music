
export interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  category?: 'trending' | 'god' | 'sad' | 'love' | 'party' | 'workout' | 'chill' | 'devotional';
  mood?: 'happy' | 'sad' | 'energetic' | 'peaceful' | 'romantic' | 'spiritual' | 'motivational';
  tags?: string[];
}

export const songs: Song[] = [
  {
    id: "1",
    title: "Shape of You",
    artist: "Ed Sheeran",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/shape-of-you.mp3",
    duration: 263,
    category: 'love',
    mood: 'romantic',
    tags: ['pop', 'romantic', 'guitar', 'love']
  },
  {
    id: "2", 
    title: "Blinding Lights",
    artist: "The Weeknd",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/blinding-lights.mp3",
    duration: 200,
    category: 'trending',
    mood: 'energetic',
    tags: ['pop', 'synth', 'dance', 'trending']
  },
  {
    id: "3",
    title: "Someone Like You", 
    artist: "Adele",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/someone-like-you.mp3",
    duration: 285,
    category: 'sad',
    mood: 'sad',
    tags: ['ballad', 'emotional', 'piano', 'heartbreak']
  },
  {
    id: "4",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars", 
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/uptown-funk.mp3",
    duration: 270,
    category: 'party',
    mood: 'energetic',
    tags: ['funk', 'party', 'dance', 'upbeat']
  },
  {
    id: "5",
    title: "Amazing Grace",
    artist: "Traditional",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300", 
    audioUrl: "/audio/amazing-grace.mp3",
    duration: 240,
    category: 'god',
    mood: 'spiritual',
    tags: ['hymn', 'worship', 'spiritual', 'traditional']
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
    tags: ['rock', 'motivation', 'workout', 'classic']
  },
  {
    id: "7",
    title: "Perfect",
    artist: "Ed Sheeran",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/perfect.mp3",
    duration: 263,
    category: 'love',
    mood: 'romantic', 
    tags: ['romantic', 'wedding', 'acoustic', 'guitar']
  },
  {
    id: "8",
    title: "Weightless",
    artist: "Marconi Union",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/weightless.mp3",
    duration: 485,
    category: 'chill',
    mood: 'peaceful',
    tags: ['ambient', 'relaxing', 'meditation', 'peaceful']
  },
  {
    id: "9",
    title: "How Great Thou Art",
    artist: "Carrie Underwood",
    imageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/how-great-thou-art.mp3",
    duration: 290,
    category: 'devotional',
    mood: 'spiritual',
    tags: ['worship', 'hymn', 'praise', 'devotional']
  },
  {
    id: "10",
    title: "Can't Stop the Feeling",
    artist: "Justin Timberlake",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/cant-stop-the-feeling.mp3",
    duration: 236,
    category: 'party',
    mood: 'happy',
    tags: ['pop', 'happy', 'dance', 'upbeat']
  },
  {
    id: "11",
    title: "Hallelujah",
    artist: "Leonard Cohen",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/hallelujah.mp3",
    duration: 312,
    category: 'god',
    mood: 'spiritual',
    tags: ['spiritual', 'classic', 'worship', 'emotional']
  },
  {
    id: "12",
    title: "Stronger",
    artist: "Kelly Clarkson",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/stronger.mp3",
    duration: 222,
    category: 'workout',
    mood: 'motivational',
    tags: ['motivational', 'pop', 'empowerment', 'workout']
  },
  {
    id: "13",
    title: "The Night We Met",
    artist: "Lord Huron",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/the-night-we-met.mp3",
    duration: 278,
    category: 'sad',
    mood: 'sad',
    tags: ['indie', 'melancholy', 'acoustic', 'heartbreak']
  },
  {
    id: "14",
    title: "All of Me",
    artist: "John Legend",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/all-of-me.mp3",
    duration: 269,
    category: 'love',
    mood: 'romantic',
    tags: ['romantic', 'piano', 'wedding', 'soulful']
  },
  {
    id: "15",
    title: "Ocean Waves",
    artist: "Nature Sounds",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/ocean-waves.mp3",
    duration: 600,
    category: 'chill',
    mood: 'peaceful',
    tags: ['nature', 'relaxing', 'meditation', 'ambient']
  }
];
