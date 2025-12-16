
import { Song } from './songs';

// Display control for Good Morning songs section
export const displayGoodMorningSongs = false; // Set to true to enable display

// Good Morning songs that can be easily updated and managed
export const goodMorningSongs: Song[] = [
  {
    id: "song214",
    title: "Garuda Gamana Tava",
    artist: "Madhuri Dasagrandhi, Revathi Mannava, Pallavi Ananthoju",
    imageUrl: "https://a10.gaanacdn.com/images/albums/48/1639248/crop_480x480_1639248.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1751168004/garuda-gamana-tava_rxfxen.mp3",
    duration: 217,
    album: "Devotional",
    year: 2025,
    genre: "Devotional",
    language: "telugu",
    sync: "devotional"
  },
  {
    id: "morning1",
    title: "inkem inkem inkem kaavaale",
    artist: "Geetha Govindam",
    imageUrl: "https://example.com/inkem-inkem-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/inkem-inkem-audio.mp3", // Replace with actual audio URL
    duration: 245,
    album: "Geetha Govindam",
    year: 2018,
    genre: "Romance",
    language: "telugu",
    sync: "love"
  },
  {
    id: "morning2", 
    title: "Dhop",
    artist: "GAME CHANGER",
    imageUrl: "https://example.com/dhop-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/dhop-audio.mp3", // Replace with actual audio URL
    duration: 267,
    album: "Game Changer",
    year: 2024,
    genre: "Dance",
    language: "telugu",
    sync: "dance"
  },
  {
    id: "morning3",
    title: "Ayyayyo",
    artist: "Mem Famous",
    imageUrl: "https://example.com/ayyayyo-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/ayyayyo-audio.mp3", // Replace with actual audio URL
    duration: 234,
    album: "Mem Famous", 
    year: 2023,
    genre: "Comedy",
    language: "telugu",
    sync: "happy"
  },
  {
    id: "morning4",
    title: "Red Sea",
    artist: "Devara",
    imageUrl: "https://example.com/red-sea-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/red-sea-audio.mp3", // Replace with actual audio URL
    duration: 289,
    album: "Devara",
    year: 2024,
    genre: "Action",
    language: "telugu",
    sync: "action"
  }
];

// Export individual songs for easy access and modification
export const garudaGamanaTava = goodMorningSongs[0];
export const inkemInkemKaavaale = goodMorningSongs[1];
export const dhop = goodMorningSongs[2];
export const ayyayyo = goodMorningSongs[3];
export const redSea = goodMorningSongs[4];
