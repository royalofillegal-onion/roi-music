import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Share2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { Song } from '@/data/songs';
import { uniqueSongs } from '@/data/allSongs';
import { toast } from 'sonner';
import SongRow from '@/components/SongRow';

interface PlaylistData {
  name: string;
  songs: string[];
  festival?: string;
}

const SharedPlaylist: React.FC = () => {
  const { encodedData } = useParams<{ encodedData: string }>();
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!encodedData) {
      setError('Invalid playlist link');
      setLoading(false);
      return;
    }

    try {
      const decoded = atob(encodedData);
      const data: PlaylistData = JSON.parse(decoded);
      setPlaylistData(data);

      // Find songs by IDs
      const playlistSongs = data.songs
        .map(songId => uniqueSongs.find(song => song.id === songId))
        .filter(Boolean) as Song[];
      
      setSongs(playlistSongs);
      setLoading(false);
    } catch (err) {
      setError('Failed to load playlist');
      setLoading(false);
    }
  }, [encodedData]);

  const sharePlaylist = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Playlist link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const playAllSongs = () => {
    if (songs.length > 0) {
      playSong(songs[0]);
      toast.success(`Playing ${playlistData?.name} playlist`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-music-accent mb-4"></div>
          <p className="text-white">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (error || !playlistData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error || 'Playlist not found'}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-32 px-4 md:px-8 md:ml-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{playlistData.name}</h1>
            <p className="text-muted-foreground">{songs.length} songs</p>
          </div>
        </div>

        {/* Playlist Info Card */}
        <Card className="mb-6 bg-gradient-to-r from-music-accent/20 to-purple-600/20 border-music-accent/30">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-white">{playlistData.name}</CardTitle>
                {playlistData.festival && (
                  <p className="text-music-accent font-medium">Special Festival Playlist</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={playAllSongs}
                  className="bg-music-accent hover:bg-music-accent/80 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play All
                </Button>
                <Button
                  onClick={sharePlaylist}
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Songs List */}
        <Card>
          <CardContent className="p-0">
            {songs.length > 0 ? (
              <div className="space-y-1">
                {songs.map((song, index) => (
                  <div key={song.id} className="hover:bg-white/5 transition-colors">
                    <SongRow 
                      song={song} 
                      index={index + 1}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No songs found in this playlist</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedPlaylist;