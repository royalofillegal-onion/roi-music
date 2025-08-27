import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Song } from '@/data/songs';
import SongCard from '@/components/SongCard';
import { usePlayer } from '@/context/PlayerContext';

interface SectionFullViewProps {
  title: string;
  songs: Song[];
  isOpen: boolean;
  onClose: () => void;
}

const SectionFullView = ({ title, songs, isOpen, onClose }: SectionFullViewProps) => {
  const { playSong } = usePlayer();

  // Handle swipe gestures to close
  useEffect(() => {
    if (!isOpen) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      
      const diffX = startX - currentX;
      const diffY = startY - currentY;

      // If horizontal swipe is more significant than vertical
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Swipe left or right with sufficient distance (100px threshold)
        if (Math.abs(diffX) > 100) {
          onClose();
        }
      }
    };

    const handleTouchEnd = () => {
      startX = 0;
      startY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSongPlay = (song: Song) => {
    playSong(song);
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto animate-fade-in" style={{ pointerEvents: 'auto' }}>
      <div className="container mx-auto px-4 py-6" style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Close full view"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Songs Grid - Responsive: 3 on mobile, 5 on laptop, 7-8 on large screens */}
        <div className="grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-4 lg:gap-6">
          {songs.map((song, index) => (
            <div 
              key={`${song.title}-${index}`} 
              className="cursor-pointer transform transition-all duration-200 hover:scale-105 animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleSongPlay(song)}
            >
              <SongCard song={song} variant="fullview" className="w-full" />
            </div>
          ))}
        </div>

        {songs.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No songs available in this section.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionFullView;