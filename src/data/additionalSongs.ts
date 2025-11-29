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
  sync?: 'sad' | 'love' | 'break' | 'happy' | 'devotional' | 'feel1' | 'action' | 'romantic' | 'friend' | 'dance' | 'folk' | 'mass' | 'party' | 'classical' | 'rap' | 'moti' | '.' | 'mother' | 'normal' | 'good' | 'Rap' | 'Feel' | 'Sad' | 'Love' | '9';
}

export const additionalSongs: Song[] = [
  {
  id: "Bagavad geetha-1",
  title: "Bagavad geetha-1",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764383234/videoplayback_tfbvti.mp4",
  duration: 556,
  album: "Bagavad geetha-1",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-2",
  title: "Bagavad geetha-2",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764383512/videoplayback_3_n8okb4.mp4",
  duration: 1008,
  album: "Bagavad geetha-2",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-3",
  title: "Bagavad geetha-3",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764383236/videoplayback_1_rx1y6t.mp4",
  duration: 645,
  album: "Bagavad geetha-3",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-4",
  title: "Bagavad geetha-4",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764383547/videoplayback_2_razn2i.mp4",
  duration: 655,
  album: "Bagavad geetha-4",
  year: 2025,
  genre: "9"
}
];
