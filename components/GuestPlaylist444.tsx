import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGuestPlaylist } from '@/hooks/useGuestPlaylist';
import { usePlayer } from '@/context/PlayerContext';
import { Play, Trash2, Music } from 'lucide-react';
import { toast } from 'sonner';

const GuestPlaylist444 = () => {
  const { guestPlaylist, removeFromGuestPlaylist, clearGuestPlaylist, playlistCount } = useGuestPlaylist();
  const { playSong } = usePlayer();

  const handlePlaySong = (song: any) => {
    playSong(song);
  };

  const handleRemoveSong = (songId: string) => {
    removeFromGuestPlaylist(songId);
    toast('Song removed from 444 playlist', { duration: 1500 });
  };

  const handleClearPlaylist = () => {
    clearGuestPlaylist();
    toast('444 playlist cleared', { duration: 1500 });
  };

  if (playlistCount === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Music className="h-5 w-5" />
            444 Playlist (Guest)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your personal playlist for saved songs (0 songs)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No songs saved yet. Click the heart icon on any song to add it to your 444 playlist!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="h-5 w-5" />
              444 Playlist (Guest)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your personal playlist ({playlistCount} songs)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearPlaylist}
            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {guestPlaylist.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors group"
              >
                <div className="text-sm text-gray-500 w-6 text-center">
                  {index + 1}
                </div>
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {song.title}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {song.artist}
                  </p>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePlaySong(song)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveSong(song.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default GuestPlaylist444;