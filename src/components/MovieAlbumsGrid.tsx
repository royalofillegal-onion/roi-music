import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Film, Music } from 'lucide-react';
import { featuredMovieAlbums } from '@/data/movieAlbums';
import { toast } from 'sonner';

interface MovieAlbumsGridProps {
  title: string;
  className?: string;
  showAll?: boolean;
}

const MovieAlbumsGrid = ({ title, className = "", showAll = false }: MovieAlbumsGridProps) => {
  const navigate = useNavigate();
  
  const albums = showAll ? featuredMovieAlbums : featuredMovieAlbums.slice(0, 10);

  const handleClick = (albumName: string) => {
    navigate(`/artist/${encodeURIComponent(albumName)}`);
  };

  const handleShare = (e: React.MouseEvent, albumName: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/artist/${encodeURIComponent(albumName)}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${albumName} Songs`,
        text: `Listen to songs from ${albumName}`,
        url: shareUrl
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied!');
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied!');
    }
  };
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
      </div>
      
      <div className="relative -mx-4 px-4">
        <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory scrollbar-hide hover:scrollbar-default">
          {albums.map((album) => (
            <div
              key={album.name}
              className="group cursor-pointer flex-shrink-0 w-28 md:w-32 snap-start"
              onClick={() => handleClick(album.name)}
            >
              <div className="relative overflow-hidden rounded-xl aspect-square bg-card/50 hover:bg-card transition-all duration-300 group-hover:scale-[1.02] shadow-sm hover:shadow-lg">
                <img
                  src={album.image}
                  alt={album.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-1 text-white/80">
                    <Music className="w-3 h-3" />
                    <span className="text-[10px]">{album.songCount} songs</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleShare(e, album.name)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                  aria-label={`Share ${album.name}`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                {album.year && (
                  <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-primary/80 text-white rounded-full font-medium">
                    {album.year}
                  </span>
                )}
              </div>
              <div className="mt-2 text-center">
                <h3 className="font-medium text-foreground text-xs truncate group-hover:text-primary transition-colors">
                  {album.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieAlbumsGrid;
