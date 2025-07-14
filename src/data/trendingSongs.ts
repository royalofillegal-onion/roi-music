import { Song } from './songs';

// Trending songs that can be easily updated and managed
export const trendingSongs: Song[] = [
  {
    id: "trending1",
    title: "Premalo",
    artist: "Court",
    imageUrl: "https://example.com/premalo-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/premalo-audio.mp3", // Replace with actual audio URL
    duration: 245,
    album: "Court",
    year: 2023,
    genre: "Romance"
  },
  {
    id: "trending2", 
    title: "Godari Gattu",
    artist: "Sankranthiki Vasthunam",
    imageUrl: "https://example.com/godari-gattu-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/godari-gattu-audio.mp3", // Replace with actual audio URL
    duration: 267,
    album: "Sankranthiki Vasthunam",
    year: 2024,
    genre: "Folk"
  },
  {
    id: "trending3",
    title: "Bujji Thalli",
    artist: "Thandel",
    imageUrl: "https://example.com/bujji-thalli-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/bujji-thalli-audio.mp3", // Replace with actual audio URL
    duration: 234,
    album: "Thandel", 
    year: 2024,
    genre: "Melody"
  },
  {
    id: "trending4",
    title: "Amaran",
    artist: "Hey Rangule",
    imageUrl: "https://example.com/amaran-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/amaran-audio.mp3", // Replace with actual audio URL
    duration: 289,
    album: "Amaran",
    year: 2024,
    genre: "Patriotic"
  },
  {
    id: "trending5",
    title: "Kumkumala",
    artist: "Brahmastra",
    imageUrl: "https://example.com/kumkumala-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/kumkumala-audio.mp3", // Replace with actual audio URL
    duration: 198,
    album: "Brahmastra",
    year: 2024,
    genre: "Devotional"
  },
  {
    id: "trending6",
    title: "Choti Choti Baatein",
    artist: "Maharshi",
    imageUrl: "https://example.com/choti-choti-baatein-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/choti-choti-baatein-audio.mp3", // Replace with actual audio URL
    duration: 276,
    album: "Maharshi",
    year: 2024,
    genre: "Romantic"
  }
];

// Export individual songs for easy access and modification
export const premalo = trendingSongs[0];
export const godariGattu = trendingSongs[1];
export const bujjiThalli = trendingSongs[2];
export const amaran = trendingSongs[3];
export const kumkumala = trendingSongs[4];
export const chotiChotiBaatein = trendingSongs[5];