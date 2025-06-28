
import React, { useState } from 'react';
import { Song } from '@/data/songs';
import { usePlayer } from '@/context/PlayerContext';
import { Play, Pause, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showNotification } from '@/utils/notificationUtils';
import AddToPlaylistDialog from '@/components/playlist/AddToPlaylistDialog';
import ShareSong from '@/components/ShareSong';

interface SongRowProps {
  song: Song;
  index: number;
  showAddToPlaylist?: boolean;
  onAddToPlaylist?: (song: Song) => void;
}

const SongRow = ({ song, index, showAddToPlaylist = false, onAddToPlaylist }: SongRowProps) => {
  const { currentSong, isPlaying, playSong, pauseSong } = usePlayer();
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlayPause = () => {
    if (isCurrentSong && isPlaying) {
      pauseSong();
    } else {
      playSong(song);
      showNotification.nowPlaying(song.title, song.artist);
    }
  };

  const handleLike = () => {
    // Only show like notification, suppress any errors
    showNotification.songLiked(song.title);
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-gray-400 text-sm w-4">{index + 1}</span>
        
        <div className="relative">
          <img 
            src={song.imageUrl} 
            alt={song.title}
            className="w-12 h-12 rounded object-cover"
          />
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{song.title}</h4>
          <p className="text-sm text-gray-400 truncate">{song.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPlaylistDialog(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <ShareSong 
          song={song} 
          className="opacity-0 group-hover:opacity-100 transition-opacity" 
        />
        
        <span className="text-xs text-gray-400">
          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
        </span>
      </div>

      <AddToPlaylistDialog 
        song={song} 
        open={showPlaylistDialog} 
        onOpenChange={setShowPlaylistDialog} 
      />
    </div>
  );
};

export default SongRow;
