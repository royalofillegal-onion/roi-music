
import { songs } from '@/data/songs';

export const getDailyRotatedSongs = (count: number = 4) => {
  // Get current date as seed for consistent daily rotation
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Create a simple hash from the day to ensure same songs for the whole day
  const seed = dayOfYear;
  
  // Shuffle array based on daily seed
  const shuffledSongs = [...songs].sort((a, b) => {
    const hashA = (seed * 9301 + parseInt(a.id, 36) * 49297) % 233280;
    const hashB = (seed * 9301 + parseInt(b.id, 36) * 49297) % 233280;
    return hashA - hashB;
  });
  
  return shuffledSongs.slice(0, count);
};

export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};
