/**
 * Song Type Definitions
 * Replaces the deleted @/data/songs after cleanup
 */

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  duration?: number;
  url?: string;
  genre?: string;
  year?: number;
  language?: string;
  featured?: string[];
  lyrics?: string;
  rating?: number;
  playCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  imageUrl?: string;
  createdAt?: Date;
}

export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  bio?: string;
  songs?: Song[];
  followers?: number;
}

// Empty arrays for the cleaned-up project
export const EMPTY_SONGS: Song[] = [];
export const EMPTY_PLAYLISTS: Playlist[] = [];
export const EMPTY_ARTISTS: Artist[] = [];
