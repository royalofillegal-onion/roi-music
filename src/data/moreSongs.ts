
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
    title: "",
    artist: "",
    album: "",
    genre: "",
    imageUrl: "",
    audioUrl: "h",
    duration: 278,
    year: 2023,
    language: "",
    sync: ""
  }
];
