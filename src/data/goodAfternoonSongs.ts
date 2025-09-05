import { Song } from './songs';

// Display control for Good Afternoon songs section
export const displayGoodAfternoonSongs = false; // Set to true to enable display

// Good Afternoon songs that can be easily updated and managed
export const goodAfternoonSongs: Song[] = [
  {
    id: "afternoon1",
    title: "Samajavaragamana",
    artist: "Ala Vaikunthapurramuloo",
    imageUrl: "https://example.com/samajavaragamana-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/samajavaragamana-audio.mp3", // Replace with actual audio URL
    duration: 245,
    album: "Ala Vaikunthapurramuloo",
    year: 2020,
    genre: "Classical",
    language: "telugu",
    sync: "classical"
  },
  {
    id: "afternoon2", 
    title: "Butta Bomma",
    artist: "Ala Vaikunthapurramuloo",
    imageUrl: "https://example.com/butta-bomma-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/butta-bomma-audio.mp3", // Replace with actual audio URL
    duration: 267,
    album: "Ala Vaikunthapurramuloo",
    year: 2020,
    genre: "Romance",
    language: "telugu",
    sync: "love"
  },
  {
    id: "afternoon3",
    title: "Ramuloo Ramulaa",
    artist: "Ala Vaikunthapurramuloo",
    imageUrl: "https://example.com/ramuloo-ramulaa-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/ramuloo-ramulaa-audio.mp3", // Replace with actual audio URL
    duration: 234,
    album: "Ala Vaikunthapurramuloo", 
    year: 2020,
    genre: "Dance",
    language: "telugu",
    sync: "dance"
  },
  {
    id: "afternoon4",
    title: "Sitharaman",
    artist: "Ala Vaikunthapurramuloo",
    imageUrl: "https://example.com/sitharaman-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/sitharaman-audio.mp3", // Replace with actual audio URL
    duration: 289,
    album: "Ala Vaikunthapurramuloo",
    year: 2020,
    genre: "Devotional",
    language: "telugu",
    sync: "devotional"
  }
];

// Export individual songs for easy access and modification
export const samajavaragamana = goodAfternoonSongs[0];
export const buttaBomma = goodAfternoonSongs[1];
export const ramulooRamulaa = goodAfternoonSongs[2];
export const sitharaman = goodAfternoonSongs[3];