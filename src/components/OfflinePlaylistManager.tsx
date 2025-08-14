import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Play, Trash2, FolderPlus, Wifi, WifiOff } from 'lucide-react';
import { Song } from '@/data/songs';
import { useOfflinePlaylist } from '@/hooks/useOfflinePlaylist';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'sonner';

interface OfflinePlaylistManagerProps {
  songs?: Song[];
  playlistName?: string;
}

const OfflinePlaylistManager: React.FC<OfflinePlaylistManagerProps> = ({
  songs = [],
  playlistName = 'My Playlist'
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const {
    offlinePlaylists,
    loading,
    downloadProgress,
    createOfflinePlaylist,
    downloadPlaylist,
    isPlaylistDownloaded,
    getDownloadedSize
  } = useOfflinePlaylist();
  
  const { playPlaylist } = usePlayer();

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    setIsCreating(true);
    const playlist = await createOfflinePlaylist(newPlaylistName);
    if (playlist && songs.length > 0) {
      await downloadPlaylist(playlist.id, songs);
    }
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleDownloadPlaylist = async (playlistId: string) => {
    if (songs.length === 0) {
      toast.error('No songs to download');
      return;
    }
    await downloadPlaylist(playlistId, songs);
  };

  const handlePlayOfflinePlaylist = (playlist: any) => {
    const playableSongs = playlist.songs
      .filter((song: any) => song.downloaded)
      .map((song: any) => song.song_data);
    
    if (playableSongs.length === 0) {
      toast.error('No downloaded songs in this playlist');
      return;
    }

    playPlaylist(playableSongs);
    toast.success(`Playing ${playlist.name} (offline)`);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOnline = navigator.onLine;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading offline playlists...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">Online - Can download songs</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-500">Offline - Playing downloaded songs only</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create New Offline Playlist */}
      {isOnline && songs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderPlus className="h-5 w-5" />
              <span>Create Offline Playlist</span>
            </CardTitle>
            <CardDescription>
              Download {songs.length} songs for offline listening
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <Button 
                onClick={handleCreatePlaylist}
                disabled={isCreating || !newPlaylistName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create & Download'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Offline Playlists */}
      <div className="space-y-4">
        {offlinePlaylists.map((playlist) => {
          const downloaded = isPlaylistDownloaded(playlist.id);
          const downloadedSongs = playlist.songs.filter(s => s.downloaded).length;
          const totalSongs = playlist.songs.length;
          const size = getDownloadedSize(playlist.id);

          return (
            <Card key={playlist.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{playlist.name}</CardTitle>
                    <CardDescription>
                      {downloadedSongs}/{totalSongs} songs downloaded
                      {size > 0 && ` • ${formatFileSize(size)}`}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {downloadedSongs > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayOfflinePlaylist(playlist)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                    )}
                    
                    {isOnline && songs.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPlaylist(playlist.id)}
                        disabled={playlist.isDownloading}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {playlist.isDownloading ? 'Downloading...' : 'Download'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {playlist.isDownloading && (
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-400">Downloading songs...</div>
                    <div className="grid grid-cols-1 gap-1">
                      {songs.slice(0, 5).map((song) => {
                        const progress = downloadProgress[song.id] || 0;
                        return (
                          <div key={song.id} className="flex items-center space-x-2 text-xs">
                            <span className="flex-1 truncate">{song.title}</span>
                            <span className="text-gray-400">{Math.round(progress)}%</span>
                          </div>
                        );
                      })}
                      {songs.length > 5 && (
                        <div className="text-xs text-gray-400">
                          ...and {songs.length - 5} more songs
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {offlinePlaylists.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Offline Playlists</h3>
            <p className="text-gray-400 mb-4">
              Create offline playlists to listen to your favorite songs without internet connection
            </p>
            {isOnline && songs.length > 0 && (
              <Button variant="outline" onClick={() => setNewPlaylistName(playlistName)}>
                Create Your First Offline Playlist
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OfflinePlaylistManager;
