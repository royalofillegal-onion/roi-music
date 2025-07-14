
import { songs, popularSongs, newReleases } from './songs';
import { trendingSongs } from './trendingSongs';
import { goodMorningSongs } from './goodMorningSongs';
import { goodAfternoonSongs } from './goodAfternoonSongs';
import { goodEveningSongs } from './goodEveningSongs';
import { additionalSongs } from './additionalSongs';
import { moreSongs } from './moreSongs';

// Combine all songs from different files
export const allSongs = [
  ...songs,
  ...trendingSongs,
  ...goodMorningSongs,
  ...goodAfternoonSongs,
  ...goodEveningSongs,
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
export { songs, trendingSongs, goodMorningSongs, goodAfternoonSongs, goodEveningSongs, popularSongs, newReleases, additionalSongs, moreSongs };
