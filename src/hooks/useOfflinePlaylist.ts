import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Song } from '@/data/songs';
import { toast } from 'sonner';

interface OfflinePlaylist {
  id: string;
  name: string;
  description?: string;
  cover_image?: string;
  songs: OfflineSong[];
  downloadedSize: number;
  isDownloading: boolean;
}

interface OfflineSong {
  song_id: string;
  song_data: Song;
  audio_blob_url?: string;
  downloaded: boolean;
}

export const useOfflinePlaylist = () => {
  const [offlinePlaylists, setOfflinePlaylists] = useState<OfflinePlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadOfflinePlaylists();
  }, []);

  const loadOfflinePlaylists = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Load from localStorage for offline access
        const saved = localStorage.getItem('offlinePlaylists');
        if (saved) {
          setOfflinePlaylists(JSON.parse(saved));
        }
        setLoading(false);
        return;
      }

      const { data: playlists, error } = await supabase
        .from('offline_playlists')
        .select('*, offline_songs(*)')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const mappedPlaylists: OfflinePlaylist[] = playlists?.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        cover_image: playlist.cover_image,
        songs: playlist.offline_songs?.map((song: any) => ({
          song_id: song.song_id,
          song_data: song.song_data,
          audio_blob_url: song.audio_blob_url,
          downloaded: !!song.audio_blob_url
        })) || [],
        downloadedSize: 0,
        isDownloading: false
      })) || [];

      setOfflinePlaylists(mappedPlaylists);
      // Also save to localStorage for offline access
      localStorage.setItem('offlinePlaylists', JSON.stringify(mappedPlaylists));
    } catch (error) {
      console.error('Error loading offline playlists:', error);
      toast.error('Failed to load offline playlists');
    } finally {
      setLoading(false);
    }
  };

  const createOfflinePlaylist = async (name: string, description?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const newPlaylist: OfflinePlaylist = {
        id: `offline-${Date.now()}`,
        name,
        description,
        songs: [],
        downloadedSize: 0,
        isDownloading: false
      };

      if (session) {
        const { data, error } = await supabase
          .from('offline_playlists')
          .insert({
            user_id: session.user.id,
            name,
            description
          })
          .select()
          .single();

        if (error) throw error;
        newPlaylist.id = data.id;
      }

      const updated = [...offlinePlaylists, newPlaylist];
      setOfflinePlaylists(updated);
      localStorage.setItem('offlinePlaylists', JSON.stringify(updated));
      
      toast.success('Offline playlist created');
      return newPlaylist;
    } catch (error) {
      console.error('Error creating offline playlist:', error);
      toast.error('Failed to create offline playlist');
      return null;
    }
  };

  const downloadSongForOffline = async (playlistId: string, song: Song): Promise<boolean> => {
    try {
      setDownloadProgress(prev => ({ ...prev, [song.id]: 0 }));
      
      // Download audio file
      const response = await fetch(song.audioUrl);
      if (!response.ok) throw new Error('Failed to download audio');
      
      const total = parseInt(response.headers.get('content-length') || '0');
      const reader = response.body?.getReader();
      let downloaded = 0;
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          chunks.push(value);
          downloaded += value.length;
          
          const progress = total > 0 ? (downloaded / total) * 100 : 50;
          setDownloadProgress(prev => ({ ...prev, [song.id]: progress }));
        }
      }

      // Create blob URL for offline playback
      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const blobUrl = URL.createObjectURL(blob);

      // Update playlist with downloaded song
      const updated = offlinePlaylists.map(playlist => {
        if (playlist.id === playlistId) {
          const existingSongIndex = playlist.songs.findIndex(s => s.song_id === song.id);
          const newSong: OfflineSong = {
            song_id: song.id,
            song_data: { ...song, audioUrl: blobUrl },
            audio_blob_url: blobUrl,
            downloaded: true
          };

          if (existingSongIndex >= 0) {
            playlist.songs[existingSongIndex] = newSong;
          } else {
            playlist.songs.push(newSong);
          }

          playlist.downloadedSize += blob.size;
        }
        return playlist;
      });

      setOfflinePlaylists(updated);
      localStorage.setItem('offlinePlaylists', JSON.stringify(updated));

      // Save to Supabase if authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !playlistId.startsWith('offline-')) {
        await supabase
          .from('offline_songs')
          .upsert({
            playlist_id: playlistId,
            song_id: song.id,
            song_data: song as any,
            audio_blob_url: blobUrl
          });
      }

      setDownloadProgress(prev => ({ ...prev, [song.id]: 100 }));
      toast.success(`${song.title} downloaded for offline listening`);
      return true;
    } catch (error) {
      console.error('Error downloading song:', error);
      toast.error(`Failed to download ${song.title}`);
      setDownloadProgress(prev => ({ ...prev, [song.id]: 0 }));
      return false;
    }
  };

  const downloadPlaylist = async (playlistId: string, songs: Song[]) => {
    const playlist = offlinePlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    // Update downloading state
    setOfflinePlaylists(prev => prev.map(p => 
      p.id === playlistId ? { ...p, isDownloading: true } : p
    ));

    let successCount = 0;
    for (const song of songs) {
      const success = await downloadSongForOffline(playlistId, song);
      if (success) successCount++;
      
      // Small delay between downloads to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update downloading state
    setOfflinePlaylists(prev => prev.map(p => 
      p.id === playlistId ? { ...p, isDownloading: false } : p
    ));

    toast.success(`Downloaded ${successCount}/${songs.length} songs for offline listening`);
  };

  const getOfflineSong = (songId: string): Song | null => {
    for (const playlist of offlinePlaylists) {
      const offlineSong = playlist.songs.find(s => s.song_id === songId && s.downloaded);
      if (offlineSong) {
        return offlineSong.song_data;
      }
    }
    return null;
  };

  const isPlaylistDownloaded = (playlistId: string): boolean => {
    const playlist = offlinePlaylists.find(p => p.id === playlistId);
    return playlist ? playlist.songs.every(s => s.downloaded) : false;
  };

  const getDownloadedSize = (playlistId: string): number => {
    const playlist = offlinePlaylists.find(p => p.id === playlistId);
    return playlist?.downloadedSize || 0;
  };

  return {
    offlinePlaylists,
    loading,
    downloadProgress,
    createOfflinePlaylist,
    downloadSongForOffline,
    downloadPlaylist,
    getOfflineSong,
    isPlaylistDownloaded,
    getDownloadedSize,
    loadOfflinePlaylists
  };
};