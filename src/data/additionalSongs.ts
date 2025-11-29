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
  sync?: 'sad' | 'love' | 'break' | 'happy' | 'devotional' | 'feel1' | 'action' | 'romantic' | 'friend' | 'dance' | 'folk' | 'mass' | 'party' | 'classical' | 'rap' | 'moti' | '.' | 'mother' | 'normal' | 'good' | 'Rap' | 'Feel' | 'Sad' | 'Love';
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
  genre: "."
}
];
