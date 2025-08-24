import { Song } from './songs';
import { allSongs, uniqueSongs } from './allSongs';
import { songs } from './songs';
import { trendingSongs } from './trendingSongs';
import { moreSongs } from './moreSongs';
import { goodMorningSongs } from './goodMorningSongs';
import { goodAfternoonSongs } from './goodAfternoonSongs';
import { goodEveningSongs } from './goodEveningSongs';
import { additionalSongs } from './additionalSongs';
import { massRapSongs } from './massRapSongs';
import { HindiSongs } from './HindiSongs';

// Create a function to generate song maps by title
function createSongMap(songArray: Song[]): Record<string, Song> {
  return songArray.reduce((map, song) => {
    if (!song || !song.title) return map;
    map[song.title] = song;
    return map;
  }, {} as Record<string, Song>);
}

// Main song maps - access songs by title like songs["Taralirada"]
export const songsByTitle = createSongMap(songs);
export const trendingSongsByTitle = createSongMap(trendingSongs);
export const moreSongsByTitle = createSongMap(moreSongs);
export const goodMorningSongsByTitle = createSongMap(goodMorningSongs);
export const goodAfternoonSongsByTitle = createSongMap(goodAfternoonSongs);
export const goodEveningSongsByTitle = createSongMap(goodEveningSongs);
export const additionalSongsByTitle = createSongMap(additionalSongs);
export const massRapSongsByTitle = createSongMap(massRapSongs);
export const hindiSongsByTitle = createSongMap(HindiSongs);

// Universal song map containing all songs
export const allSongsByTitle = createSongMap(uniqueSongs);

// Helper function to find song by partial title match
export function findSongByTitle(title: string): Song | undefined {
  // First try exact match
  if (allSongsByTitle[title]) {
    return allSongsByTitle[title];
  }
  
  // Then try case-insensitive match
  const lowerTitle = title.toLowerCase();
  const song = uniqueSongs.find(s => s.title.toLowerCase() === lowerTitle);
  return song;
}

// Helper function to search songs by partial title
export function searchSongsByTitle(partialTitle: string): Song[] {
  const searchTerm = partialTitle.toLowerCase();
  return uniqueSongs.filter(song => 
    song.title.toLowerCase().includes(searchTerm)
  );
}

// Export all collections for backward compatibility
export {
  songs,
  trendingSongs,
  moreSongs,
  goodMorningSongs,
  goodAfternoonSongs,
  goodEveningSongs,
  additionalSongs,
  massRapSongs,
  HindiSongs,
  allSongs,
  uniqueSongs
};