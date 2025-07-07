
import { songs, trendingSongs, popularSongs, newReleases } from './songs';
import { additionalSongs } from './additionalSongs';
import { moreSongs } from './moreSongs';

// Combine all songs from different files
export const allSongs = [
  ...songs,
  ...trendingSongs,
  ...popularSongs, 
  ...newReleases,
  ...additionalSongs,
  ...moreSongs
];

// Remove duplicates based on song ID
export const uniqueSongs = allSongs.filter((song, index, self) => 
  index === self.findIndex(s => s.id === song.id)
);

// Export organized song collections
export { songs, trendingSongs, popularSongs, newReleases, additionalSongs, moreSongs };
