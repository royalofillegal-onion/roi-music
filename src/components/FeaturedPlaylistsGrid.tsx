import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { getFeaturedPlaylists, FeaturedPlaylist } from "@/utils/dailyPlaylistShuffle";
import { Play, ChevronRight, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/data/songs";
import { uniqueSongs } from "@/data/allSongs";

interface UserPlaylist {
  id: string;
  name: string;
  cover_image: string | null;
  song_count: number;
  songs: Song[];
}

interface FeaturedPlaylistsGridProps {
  title?: string;
  className?: string;
}

const FeaturedPlaylistsGrid: React.FC<FeaturedPlaylistsGridProps> = ({
  title = "Featured Playlists",
  className = ""
}) => {
  const navigate = useNavigate();
  const { playSong, playPlaylist } = usePlayer();
  const featuredPlaylists = getFeaturedPlaylists();
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      // Fetch user playlists
      const { data: playlists } = await supabase
        .from('playlists')
        .select('id, name, cover_image')
        .eq('user_id', session.user.id)
        .limit(5);

      if (playlists && playlists.length > 0) {
        const playlistIds = playlists.map(p => p.id);

        const { data: playlistSongsData } = await supabase
          .from('playlist_songs')
          .select('song_id, playlist_id')
          .in('playlist_id', playlistIds);

        const songMap = new Map(uniqueSongs.map(s => [s.id, s]));

        const songsByPlaylistId: Record<string, Song[]> = {};
        playlistIds.forEach(id => {
          songsByPlaylistId[id] = [];
        });

        playlistSongsData?.forEach(ps => {
          const song = songMap.get(ps.song_id);
          if (song && songsByPlaylistId[ps.playlist_id]) {
            songsByPlaylistId[ps.playlist_id].push(song);
          }
        });

        const playlistsWithSongs = playlists.map(playlist => ({
          ...playlist,
          song_count: songsByPlaylistId[playlist.id].length,
          songs: songsByPlaylistId[playlist.id]
        }));

        setUserPlaylists(playlistsWithSongs);
      }
    };

    fetchUserPlaylists();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserPlaylists();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlayPlaylist = (playlist: FeaturedPlaylist | UserPlaylist, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.songs.length > 0) {
      playPlaylist(playlist.songs);
    }
  };

  const handleViewFeaturedPlaylist = (playlist: FeaturedPlaylist) => {
    navigate('/playlists');
  };

  const handleViewUserPlaylist = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  const allPlaylists = [...featuredPlaylists, ...userPlaylists];

  if (allPlaylists.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
        <button
          onClick={() => navigate('/playlists')}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-hide hover:scrollbar-default scroll-smooth pb-2 snap-x snap-mandatory">
        <div className="flex gap-3 w-max">
          {/* Featured Playlists */}
          {featuredPlaylists.map((playlist, index) => (
            <div
              key={playlist.id}
              className="group relative w-36 md:w-44 flex-shrink-0 snap-start cursor-pointer"
              onClick={() => handleViewFeaturedPlaylist(playlist)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <img
                  src={playlist.coverImage}
                  alt={playlist.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <button
                  onClick={(e) => handlePlayPlaylist(playlist, e)}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-110"
                >
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                </button>
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                  <span className="text-xs text-white font-medium">{playlist.songs.length} songs</span>
                </div>
              </div>
              <div className="space-y-0.5 px-1">
                <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {playlist.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {playlist.description}
                </p>
              </div>
            </div>
          ))}

          {/* User Created Playlists */}
          {userPlaylists.map((playlist, index) => (
            <div
              key={`user-${playlist.id}`}
              className="group relative w-36 md:w-44 flex-shrink-0 snap-start cursor-pointer"
              onClick={() => handleViewUserPlaylist(playlist.id)}
              style={{ animationDelay: `${(featuredPlaylists.length + index) * 50}ms` }}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg group-hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary/20 to-secondary/20">
                {playlist.cover_image ? (
                  <img
                    src={playlist.cover_image}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <button
                  onClick={(e) => handlePlayPlaylist(playlist, e)}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-110"
                >
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                </button>
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/80 backdrop-blur-sm rounded-full">
                  <span className="text-xs text-white font-medium">Your Playlist</span>
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                  <span className="text-xs text-white font-medium">{playlist.song_count} songs</span>
                </div>
              </div>
              <div className="space-y-0.5 px-1">
                <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {playlist.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Created by you
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedPlaylistsGrid;
