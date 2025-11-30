// Fixed import paths
import { songs, popularSongs } from './songs';
import { trendingSongs } from './trendingSongs';
import { goodMorningSongs, displayGoodMorningSongs } from './goodMorningSongs';
import { goodAfternoonSongs, displayGoodAfternoonSongs } from './goodAfternoonSongs';
import { goodEveningSongs, displayGoodEveningSongs } from './goodEveningSongs';
import { additionalSongs } from './additionalSongs';
import { moreSongs, newReleases } from './moreSongs';
import { massRapSongs } from './massRapSongs';
import { HindiSongs, displayHindiSongs } from './HindiSongs';

// Combine all songs from different files, respecting display settings
export const allSongs = [
  ...songs,
  ...trendingSongs,
  ...(displayGoodMorningSongs ? goodMorningSongs : []),
  ...(displayGoodAfternoonSongs ? goodAfternoonSongs : []),
  ...(displayGoodEveningSongs ? goodEveningSongs : []),
  ...popularSongs, 
  ...newReleases,
  ...additionalSongs,
  ...moreSongs,
  ...massRapSongs,
  ...(displayHindiSongs ? HindiSongs : [])
];

// Remove duplicates based on title and artist only (filter duplicates by track)
export const uniqueSongs = allSongs.filter((song, index, self) => {
  if (!song || !song.title || !song.artist) return false;
  
  // Check if this is the first occurrence of this song by title and artist only
  const firstIndex = self.findIndex(s => 
    s && s.title && s.artist && 
    s.title.toLowerCase().trim() === song.title.toLowerCase().trim() && 
    s.artist.toLowerCase().trim() === song.artist.toLowerCase().trim()
  );
  
  // Only keep the first occurrence
  return index === firstIndex;
});

// Group songs by sync for better navigation
export const songsBySync = uniqueSongs.reduce((acc, song) => {
  const sync = song.sync || 'uncategorized';
  if (!acc[sync]) acc[sync] = [];
  acc[sync].push(song);
  return acc;
}, {} as Record<string, typeof uniqueSongs>);

// Group songs by artist for artist mode
export const songsByArtist = uniqueSongs.reduce((acc, song) => {
  const artist = song.artist.toLowerCase();
  if (!acc[artist]) acc[artist] = [];
  acc[artist].push(song);
  return acc;
}, {} as Record<string, typeof uniqueSongs>);

// Create song maps for title-based access
const createSongMap = (songArray: typeof uniqueSongs) => {
  return songArray.reduce((map, song) => {
    if (!song || !song.title) return map;
    map[song.title] = song;
    return map;
  }, {} as Record<string, typeof uniqueSongs[0]>);
};

// Song maps for easy access by title: songs["Taralirada"]
export const songsByTitle = createSongMap(songs);
export const trendingSongsByTitle = createSongMap(trendingSongs);
export const goodMorningSongsByTitle = createSongMap(goodMorningSongs);
export const goodAfternoonSongsByTitle = createSongMap(goodAfternoonSongs);
export const goodEveningSongsByTitle = createSongMap(goodEveningSongs);
export const popularSongsByTitle = createSongMap(popularSongs);
export const newReleasesByTitle = createSongMap(newReleases);
export const additionalSongsByTitle = createSongMap(additionalSongs);
export const moreSongsByTitle = createSongMap(moreSongs);
export const massRapSongsByTitle = createSongMap(massRapSongs);
export const hindiSongsByTitle = createSongMap(HindiSongs);

// Universal song map containing all unique songs
export const allSongsByTitle = createSongMap(uniqueSongs);

// Export organized song collections
export { songs, trendingSongs, goodMorningSongs, goodAfternoonSongs, goodEveningSongs, popularSongs, newReleases, additionalSongs, moreSongs, massRapSongs, HindiSongs };
