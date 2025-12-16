// Movie albums data
import { allSongs } from './allSongs';

export interface MovieAlbum {
  name: string;
  year?: number;
  image: string;
  songCount: number;
  display?: boolean;
}

// Dynamically generate movie albums from songs
export const getMovieAlbums = (): MovieAlbum[] => {
  const albumMap = new Map<string, { image: string; count: number; year?: number }>();
  
  allSongs.forEach(song => {
    const movieName = song.artist; // artist field contains movie name
    if (!albumMap.has(movieName)) {
      albumMap.set(movieName, {
        image: song.imageUrl,
        count: 1,
        year: song.year
      });
    } else {
      const existing = albumMap.get(movieName)!;
      existing.count += 1;
    }
  });

  return Array.from(albumMap.entries())
    .map(([name, data]) => ({
      name,
      year: data.year,
      image: data.image,
      songCount: data.count,
      display: true
    }))
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .slice(0, 15); // Top 15 movies
};

export const featuredMovieAlbums = getMovieAlbums();
