import { Song } from '@/data/songs';

// Utility to enhance songs with language and sync properties
export const enhanceSongData = (song: Song): Song => {
  // If already has both properties, return as is
  if (song.language && song.sync) {
    return song;
  }

  // Auto-detect language based on song titles, artists, and existing data
  let language: 'telugu' | 'hindi' | 'tamil' | 'kannada' | 'other' = song.language || 'telugu';
  
  // Auto-detect sync based on genre, album, and title keywords
  let sync: 'sad' | 'love' | 'happy' | 'devotional' | 'dance' | 'action' | 'romantic' | 'party' | 'classical' | 'folk' = 'happy';

  const title = song.title.toLowerCase();
  const genre = song.genre?.toLowerCase() || '';
  const album = song.album?.toLowerCase() || '';

  // Language detection logic
  if (!song.language) {
    // Most songs in the collection appear to be Telugu
    language = 'telugu';
  }

  // Sync detection based on keywords and context
  if (genre.includes('feel') || genre.includes('emotional') || title.includes('sad') || album.includes('sad')) {
    sync = 'sad';
  } else if (genre.includes('love') || genre.includes('romantic') || title.includes('prema') || title.includes('love') || album.includes('love')) {
    sync = 'love';
  } else if (genre.includes('devotional') || title.includes('deva') || title.includes('god') || title.includes('namah')) {
    sync = 'devotional';
  } else if (genre.includes('dance') || title.includes('dance') || title.includes('party')) {
    sync = 'dance';
  } else if (genre.includes('action') || title.includes('fight') || title.includes('war') || genre.includes('title track')) {
    sync = 'action';
  } else if (genre.includes('romantic') || genre.includes('melody')) {
    sync = 'romantic';
  } else if (genre.includes('folk')) {
    sync = 'folk';
  } else if (genre.includes('classical')) {
    sync = 'classical';
  } else if (album.includes('party') || genre.includes('party')) {
    sync = 'party';
  } else {
    sync = 'happy'; // Default fallback
  }

  return {
    ...song,
    language,
    sync
  };
};

// Enhance entire song array
export const enhanceAllSongs = (songs: Song[]): Song[] => {
  return songs.map(enhanceSongData);
};