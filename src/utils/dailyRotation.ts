
import { songs } from '@/data/songs';
import { goodMorningSongs, displayGoodMorningSongs } from '@/data/goodMorningSongs';
import { goodAfternoonSongs, displayGoodAfternoonSongs } from '@/data/goodAfternoonSongs';
import { goodEveningSongs, displayGoodEveningSongs } from '@/data/goodEveningSongs';

export const getTimeBasedSongs = (count: number = 4) => {
  const hour = new Date().getHours();
  let songsToUse = goodMorningSongs; // Default to morning songs
  let shouldDisplay = displayGoodMorningSongs; // Default display setting
  
  // Time ranges: 1 AM - 12 PM = Morning, 12 PM - 6 PM = Afternoon, 6 PM - 1 AM = Evening
  if (hour >= 1 && hour < 12) {
    songsToUse = goodMorningSongs;
    shouldDisplay = displayGoodMorningSongs;
  } else if (hour >= 12 && hour < 18) {
    songsToUse = goodAfternoonSongs;
    shouldDisplay = displayGoodAfternoonSongs;
  } else {
    songsToUse = goodEveningSongs;
    shouldDisplay = displayGoodEveningSongs;
  }
  
  // If display is disabled, return empty array
  if (!shouldDisplay) {
    return [];
  }
  
  // Get current date as seed for consistent daily rotation
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Create a simple hash from the day to ensure same songs for the whole day
  const seed = dayOfYear;
  
  // Shuffle array based on daily seed
  const shuffledSongs = [...songsToUse].sort((a, b) => {
    const hashA = (seed * 9301 + parseInt(a.id, 36) * 49297) % 233280;
    const hashB = (seed * 9301 + parseInt(b.id, 36) * 49297) % 233280;
    return hashA - hashB;
  });
  
  return shuffledSongs.slice(0, count);
};

export const getDailyRotatedSongs = (count: number = 4) => {
  // Keep the old function for backward compatibility
  return getTimeBasedSongs(count);
};

export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};
