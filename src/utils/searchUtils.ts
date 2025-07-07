
import { songs, Song } from '@/data/songs';
import { enhancedSongs } from '@/data/songsData';

// Convert enhanced songs to Song format
const convertEnhancedToSong = (enhancedSong: any): Song => ({
  id: enhancedSong.id,
  title: enhancedSong.title,
  artist: enhancedSong.artist,
  imageUrl: enhancedSong.imageUrl,
  audioUrl: enhancedSong.audioUrl,
  duration: enhancedSong.duration,
  category: enhancedSong.category,
  mood: enhancedSong.mood,
  tags: enhancedSong.tags,
  album: enhancedSong.album || 'Unknown Album',
  genre: enhancedSong.genre || 'Unknown Genre'
});

// Get all songs from both sources
export const getAllSongs = (): Song[] => {
  const originalSongs = songs;
  const convertedEnhancedSongs = enhancedSongs.map(convertEnhancedToSong);
  
  // Combine and deduplicate by ID
  const allSongs = [...originalSongs, ...convertedEnhancedSongs];
  const uniqueSongs = allSongs.filter((song, index, self) => 
    index === self.findIndex(s => s.id === song.id)
  );
  
  return uniqueSongs;
};

// Search function that works across all songs
export const searchAllSongs = (query: string): Song[] => {
  const allSongs = getAllSongs();
  const lowerQuery = query.toLowerCase();
  
  return allSongs.filter(song =>
    song.title.toLowerCase().includes(lowerQuery) ||
    song.artist.toLowerCase().includes(lowerQuery) ||
    (song.category && song.category.toLowerCase().includes(lowerQuery)) ||
    (song.mood && song.mood.toLowerCase().includes(lowerQuery)) ||
    (song.album && song.album.toLowerCase().includes(lowerQuery)) ||
    (song.genre && song.genre.toLowerCase().includes(lowerQuery)) ||
    (song.tags && song.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
};

// Get songs by category from all sources
export const getSongsByCategory = (category: string): Song[] => {
  const allSongs = getAllSongs();
  return allSongs.filter(song => 
    (song.category && song.category.toLowerCase() === category.toLowerCase()) ||
    (song.tags && song.tags.some(tag => tag.toLowerCase() === category.toLowerCase()))
  );
};

// Get songs by mood from all sources
export const getSongsByMood = (mood: string): Song[] => {
  const allSongs = getAllSongs();
  return allSongs.filter(song => 
    song.mood && song.mood.toLowerCase() === mood.toLowerCase()
  );
};

// Get trending songs from all sources
export const getTrendingSongs = (): Song[] => {
  const allSongs = getAllSongs();
  return allSongs.filter(song => 
    song.category === 'trending' || 
    (song.tags && song.tags.includes('trending'))
  ).slice(0, 10);
};

// Get popular songs from all sources
export const getPopularSongs = (): Song[] => {
  const allSongs = getAllSongs();
  return allSongs.filter(song => 
    song.mood === 'happy' || 
    song.mood === 'energetic' ||
    (song.tags && (song.tags.includes('popular') || song.tags.includes('dance')))
  ).slice(0, 10);
};
