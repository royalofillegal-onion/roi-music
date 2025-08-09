import { Song } from './songs';

// Trending songs that can be easily updated and managed
export const trendingSongs: Song[] = [
  {
    id: "trending1",
    title: "Minnalvala",
    artist: "Narivetta",
    imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752507033/Minnalvala-From-Narivetta-Malayalam-2025-20250416150421-500x500_cixjbx.jpg", // Replace with actual image URL
    audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752507065/Minnalvala_qocusu.mp3", // Replace with actual audio URL
    duration: 299,
    album: "Love",
    year: 2025,
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
    title: "Om Namo Bhagavate Vasudevaya",
    artist: "Mahavatar Narsimha",
    imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754701000/IMG_20250809_062624_f6ogak.jpg",
    audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754701019/Om_Namo_Bhagavate_Vasudevaya_Lyrical_Video_-_Hindi___Hombale_Films___Kleem_Productions___Sam_CS_gjchsu.mp3",
    duration: 222,
    album: "Mahavatar Narsimha",
    year: 2025,
    genre: "Love it"
  }
];

// Export individual songs for easy access and modification
export const premalo = trendingSongs[0];
export const godariGattu = trendingSongs[1];
export const bujjiThalli = trendingSongs[2];
export const amaran = trendingSongs[3];
export const kumkumala = trendingSongs[4];
export const chotiChotiBaatein = trendingSongs[5];
