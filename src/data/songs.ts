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
  album?: string;
  genre?: string;
}

export const songs: Song[] = [
  {
    id: "1",
    title: "Shape of You",
    artist: "Ed Sheeran",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/shape-of-you.mp3",
    duration: 234,
    category: 'trending',
    mood: 'happy',
    tags: ['pop', 'dance', 'trending'],
    album: "÷ (Divide)",
    genre: "Pop"
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/blinding-lights.mp3",
    duration: 200,
    category: 'trending',
    mood: 'energetic',
    tags: ['pop', 'synth', 'trending'],
    album: "After Hours",
    genre: "Synth-pop"
  },
  {
    id: "3",
    title: "Someone Like You",
    artist: "Adele",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/someone-like-you.mp3",
    duration: 285,
    category: 'sad',
    mood: 'sad',
    tags: ['ballad', 'emotional', 'sad'],
    album: "21",
    genre: "Pop Ballad"
  },
  {
    id: "4",
    title: "Perfect",
    artist: "Ed Sheeran",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/perfect.mp3",
    duration: 263,
    category: 'love',
    mood: 'romantic',
    tags: ['romantic', 'wedding', 'love'],
    album: "÷ (Divide)",
    genre: "Pop Folk"
  },
  {
    id: "5",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/uptown-funk.mp3",
    duration: 270,
    category: 'party',
    mood: 'energetic',
    tags: ['funk', 'party', 'dance'],
    album: "Uptown Special",
    genre: "Funk Pop"
  },
  {
    id: "6",
    title: "Hello",
    artist: "Adele",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/hello.mp3",
    duration: 295,
    category: 'sad',
    mood: 'sad',
    tags: ['ballad', 'emotional', 'sad'],
    album: "25",
    genre: "Pop Ballad"
  },
  {
    id: "7",
    title: "Can't Stop the Feeling!",
    artist: "Justin Timberlake",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/cant-stop-the-feeling.mp3",
    duration: 216,
    category: 'party',
    mood: 'happy',
    tags: ['pop', 'dance', 'party', 'upbeat'],
    album: "Trolls Soundtrack",
    genre: "Pop"
  },
  {
    id: "8",
    title: "Thinking Out Loud",
    artist: "Ed Sheeran",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/thinking-out-loud.mp3",
    duration: 281,
    category: 'love',
    mood: 'romantic',
    tags: ['romantic', 'acoustic', 'love'],
    album: "x (Multiply)",
    genre: "Pop Folk"
  },
  {
    id: "9",
    title: "Bad Guy",
    artist: "Billie Eilish",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/bad-guy.mp3",
    duration: 194,
    category: 'trending',
    mood: 'energetic',
    tags: ['pop', 'alternative', 'trending'],
    album: "When We All Fall Asleep, Where Do We Go?",
    genre: "Electropop"
  },
  {
    id: "10",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/watermelon-sugar.mp3",
    duration: 174,
    category: 'trending',
    mood: 'happy',
    tags: ['pop', 'summer', 'trending'],
    album: "Fine Line",
    genre: "Pop Rock"
  },
  {
    id: "11",
    title: "Amazing Grace",
    artist: "Traditional",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/amazing-grace.mp3",
    duration: 240,
    category: 'god',
    mood: 'spiritual',
    tags: ['spiritual', 'hymn', 'worship', 'god'],
    album: "Traditional Hymns",
    genre: "Gospel"
  },
  {
    id: "12",
    title: "How Great Thou Art",
    artist: "Carrie Underwood",
    imageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=300&h=300",
    audioUrl: "/audio/how-great-thou-art.mp3",
    duration: 290,
    category: 'devotional',
    mood: 'spiritual',
    tags: ['worship', 'hymn', 'devotional', 'god'],
    album: "How Great Thou Art: Gospel Favorites",
    genre: "Gospel"
  }
];

// Create filtered arrays for compatibility
export const trendingSongs = songs.filter(song => song.category === 'trending');
export const popularSongs = songs.filter(song => song.tags?.includes('popular') || song.category === 'love' || song.mood === 'energetic');
export const newReleases = songs.slice(-6); // Get the last 6 songs as new releases
