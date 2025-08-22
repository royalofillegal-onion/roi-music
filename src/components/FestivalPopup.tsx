import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Music, Share2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Song } from '@/data/songs';
import { trendingSongs } from '@/data/allSongs';
import { HindiSongs } from '@/data/HindiSongs';

interface FestivalData {
  id: string;
  name: string;
  image: string;
  description: string;
  playlist: Song[];
  startDate: Date;
  endDate: Date;
  wishes: string[];
}

const festivals: FestivalData[] = [
  {
    id: 'diwali',
    name: 'Diwali Special',
    image: '/lovable-uploads/19567533-e730-40be-8532-539786f8a625.png',
    description: 'Celebrate the Festival of Lights with our special Diwali playlist!',
    playlist: [...HindiSongs.slice(0, 6), ...trendingSongs.slice(0, 4)],
    startDate: new Date('2024-10-30'),
    endDate: new Date('2024-11-05'),
    wishes: [
      'May this Diwali bring joy, prosperity and happiness to your life! 🪔',
      'Wishing you a sparkling Diwali filled with music and love! ✨',
      'Let the lights guide your path to success and happiness! 🎆'
    ]
  },
  {
    id: 'holi',
    name: 'Holi Celebration',
    image: '/lovable-uploads/19567533-e730-40be-8532-539786f8a625.png',
    description: 'Splash into the colors of music this Holi!',
    playlist: [...trendingSongs.slice(0, 8)],
    startDate: new Date('2025-03-12'),
    endDate: new Date('2025-03-15'),
    wishes: [
      'May your life be filled with colors of joy! 🌈',
      'Happy Holi! Let music paint your world beautiful! 🎨',
      'Celebrate with colors and melodies! 🎵'
    ]
  }
];

interface FestivalPopupProps {
  onClose: () => void;
}

const FestivalPopup: React.FC<FestivalPopupProps> = ({ onClose }) => {
  const [currentFestival, setCurrentFestival] = useState<FestivalData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkActiveFestival = () => {
      const now = new Date();
      const activeFestival = festivals.find(festival => 
        now >= festival.startDate && now <= festival.endDate
      );
      
      if (activeFestival) {
        setCurrentFestival(activeFestival);
        
        // Check if user has seen this festival popup today
        const lastShown = localStorage.getItem(`festival_popup_${activeFestival.id}`);
        const today = new Date().toDateString();
        
        if (lastShown !== today) {
          setIsVisible(true);
          localStorage.setItem(`festival_popup_${activeFestival.id}`, today);
        }
      }
    };

    checkActiveFestival();
  }, []);

  const sharePlaylist = async () => {
    if (!currentFestival) return;
    
    const playlistData = {
      name: currentFestival.name,
      songs: currentFestival.playlist.map(song => song.id),
      festival: currentFestival.id
    };
    
    const encoded = btoa(JSON.stringify(playlistData));
    const shareUrl = `${window.location.origin}/shared-playlist/${encoded}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Playlist link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!currentFestival || !isVisible) return null;

  const randomWish = currentFestival.wishes[Math.floor(Math.random() * currentFestival.wishes.length)];

  return (
    <Dialog open={isVisible} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 bg-gradient-to-br from-music-primary/95 to-music-secondary/95 backdrop-blur-lg border-music-accent/30 overflow-hidden">
        <div className="relative h-full flex flex-col md:flex-row">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border border-white/20"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Left Section - Festival Info */}
          <div className="flex-1 p-6 md:p-8 text-center">
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {currentFestival.name}
              </h2>
              <p className="text-lg text-white/80 mb-4">
                {currentFestival.description}
              </p>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30">
                <p className="text-white font-medium">
                  {randomWish}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={sharePlaylist}
                className="bg-music-accent hover:bg-music-accent/80 text-white flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Playlist
              </Button>
              <Button
                onClick={() => window.open(`/playlist/${currentFestival.id}`, '_blank')}
                variant="outline"
                className="border-white/50 text-white hover:bg-white/10 flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Full Playlist
              </Button>
            </div>
          </div>

          {/* Right Section - Festival Images Grid */}
          <div className="flex-1 p-6 md:p-8">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Main Image */}
              <div className="col-span-2 relative rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                <img 
                  src={currentFestival.image} 
                  alt={currentFestival.name}
                  className="w-full h-40 md:h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-2 text-white">
                    <Music className="h-5 w-5" />
                    <span className="font-medium">{currentFestival.playlist.length} Songs</span>
                  </div>
                </div>
              </div>

              {/* Playlist Preview */}
              <div className="col-span-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 overflow-y-auto">
                <h3 className="text-white font-semibold mb-3">Featured Songs</h3>
                <div className="space-y-2">
                  {currentFestival.playlist.slice(0, 4).map((song, index) => (
                    <div key={song.id} className="flex items-center gap-3 text-white/80 text-sm">
                      <span className="text-music-accent font-medium">{index + 1}.</span>
                      <div className="flex-1 truncate">
                        <div className="font-medium truncate">{song.title}</div>
                        <div className="text-white/60 truncate">{song.artist}</div>
                      </div>
                    </div>
                  ))}
                  {currentFestival.playlist.length > 4 && (
                    <div className="text-music-accent text-sm font-medium">
                      +{currentFestival.playlist.length - 4} more songs...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FestivalPopup;