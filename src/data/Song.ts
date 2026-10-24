export interface Song {
  id: string;
  title: string;
  artist: string;
  singer?: string;
  movie?: string;
  imageUrl: string;
  audioUrl: string;
  /** Optional music video shown in the discovery feed. */
  videoUrl?: string;
  duration: number;
  album?: string;
  year?: number;
  genre?: string;
  language?: string;
  sync?: string;
  isPublished?: boolean;
}