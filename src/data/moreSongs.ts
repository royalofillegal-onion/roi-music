
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  year?: number;
  language?: 'telugu' | 'hindi' | 'tamil' | 'kannada' | 'other';
  sync?: 'sad' | 'love' | 'happy' | 'devotional' | 'dance' | 'action' | 'romantic' | 'party' | 'classical' | 'folk';
}

export const moreSongs: Song[] = [
  {
    id: "more-001",
    title: "Thunder Storm",
    artist: "Electric Pulse",
    album: "Storm Series",
    genre: "Electronic Rock",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-9.mp3",
    duration: 278,
    year: 2023,
    language: "other",
    sync: "action"
  },
  {
    id: "more-002",
    title: "Gentle Rain",
    artist: "Nature Sounds",
    album: "Weather Moods",
    genre: "Ambient",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-10.mp3",
    duration: 345,
    year: 2022,
    language: "other",
    sync: "sad"
  },
  {
    id: "more-003",
    title: "Dance Floor Fire",
    artist: "Party Masters",
    album: "Club Hits",
    genre: "Dance",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-11.mp3",
    duration: 189,
    year: 2023,
    language: "other",
    sync: "dance"
  },
  {
    id: "more-004",
    title: "Broken Wings",
    artist: "Melancholy Soul",
    album: "Sad Stories",
    genre: "Alternative",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-12.mp3",
    duration: 267,
    year: 2022,
    language: "other",
    sync: "sad"
  },
  {
    id: "more-005",
    title: "Morning Prayer",
    artist: "Divine Harmony",
    album: "Sacred Moments",
    genre: "Devotional",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-13.mp3",
    duration: 412,
    year: 2023,
    language: "other",
    sync: "devotional"
  },
  {
    id: "more-006",
    title: "Workout Beast",
    artist: "Fitness Motivation",
    album: "Gym Anthems",
    genre: "Hip Hop",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-14.mp3",
    duration: 198,
    year: 2023,
    language: "other",
    sync: "action"
  },
  {
    id: "more-007",
    title: "Sweet Romance",
    artist: "Love Ballads",
    album: "Heart Songs",
    genre: "Pop Ballad",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-15.mp3",
    duration: 256,
    year: 2022,
    language: "other",
    sync: "love"
  },
  {
    id: "more-008",
    title: "Trending Waves",
    artist: "Current Hits",
    album: "Now Playing",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-16.mp3",
    duration: 223,
    year: 2023,
    language: "other",
    sync: "party"
  }
];
