import { Song } from './songs';

// Good Evening songs that can be easily updated and managed
export const goodEveningSongs: Song[] = [
  {
    id: "evening1",
    title: "Nuvvunte Chaley",
    artist: "Andhra King Taluka",
    imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754743786/andhrakingtaluka-20250515112950-23300_mu8zny.jpg",
    audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754743776/Nuvvunte_Chaley_gvcrva.mp3",
    duration: 240,
    album: "Nuvvunte Chaley",
    year: 2025,
    genre: "."
  },
  {
    id: "evening2", 
    title: "Fidaa",
    artist: "Fidaa",
    imageUrl: "https://example.com/fidaa-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/fidaa-audio.mp3", // Replace with actual audio URL
    duration: 267,
    album: "Fidaa",
    year: 2017,
    genre: "Melody"
  },
  {
    id: "evening3",
    title: "Malli Raava",
    artist: "Malli Raava",
    imageUrl: "https://example.com/malli-raava-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/malli-raava-audio.mp3", // Replace with actual audio URL
    duration: 234,
    album: "Malli Raava", 
    year: 2017,
    genre: "Romance"
  },
  {
    id: "evening4",
    title: "Mahanati",
    artist: "Mahanati",
    imageUrl: "https://example.com/mahanati-poster.jpg", // Replace with actual image URL
    audioUrl: "https://example.com/mahanati-audio.mp3", // Replace with actual audio URL
    duration: 289,
    album: "Mahanati",
    year: 2018,
    genre: "Classical"
  }
];

// Export individual songs for easy access and modification
export const choosiChudangane = goodEveningSongs[0];
export const fidaa = goodEveningSongs[1];
export const malliRaava = goodEveningSongs[2];
export const mahanati = goodEveningSongs[3];
