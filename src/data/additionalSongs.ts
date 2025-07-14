
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
}

export const additionalSongs: Song[] = [
  {
    id: "add-001",
    title: "Midnight Dreams",
    artist: "Luna Echo",
    album: "Night Vibes",
    genre: "Electronic",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-1.mp3",
    duration: 245,
    year: 2023
  },
  {
    id: "add-002",
    title: "Summer Breeze",
    artist: "Coastal Waves",
    album: "Ocean Sounds",
    genre: "Pop",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-2.mp3",
    duration: 198,
    year: 2023
  },
  {
    id: "add-003",
    title: "Mountain High",
    artist: "Adventure Souls",
    album: "Journey",
    genre: "Rock",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-3.mp3",
    duration: 267,
    year: 2022
  },
  {
    id: "add-004",
    title: "Golden Sunset",
    artist: "Peaceful Mind",
    album: "Tranquil",
    genre: "Ambient",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-4.mp3",
    duration: 312,
    year: 2023
  },
  {
    id: "add-005",
    title: "City Lights",
    artist: "Urban Rhythm",
    album: "Metropolis",
    genre: "Hip Hop",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-5.mp3",
    duration: 223,
    year: 2023
  },
  {
    id: "add-006",
    title: "Heartbreak Symphony",
    artist: "Emotional Strings",
    album: "Deep Feelings",
    genre: "Classical",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-6.mp3",
    duration: 456,
    year: 2022
  },
  {
    id: "add-007",
    title: "Divine Grace",
    artist: "Sacred Voices",
    album: "Spiritual Journey",
    genre: "Devotional",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-7.mp3",
    duration: 389,
    year: 2023
  },
  {
    id: "add-008",
    title: "Love Forever",
    artist: "Romance Band",
    album: "Eternal Love",
    genre: "R&B",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundjay.com/misc/sounds-8.mp3",
    duration: 234,
    year: 2023
  }
];
