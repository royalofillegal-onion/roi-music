import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Mic2 } from 'lucide-react';
import { visibleSingers, visibleMusicDirectors, Singer } from '@/data/singers';
import { toast } from 'sonner';

interface SingersGridProps {
  title: string;
  type: 'singers' | 'music-directors';
  className?: string;
  showAll?: boolean;
}

const SingersGrid = ({ title, type, className = "", showAll = false }: SingersGridProps) => {
  const navigate = useNavigate();
  
  const items = type === 'singers' ? visibleSingers : visibleMusicDirectors;
  const displayItems = showAll ? items : items.slice(0, 8);

  const handleClick = (name: string) => {
    navigate(`/artist/${encodeURIComponent(name)}`);
  };

  const handleShare = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/artist/${encodeURIComponent(name)}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Check out ${name}`,
        text: `Listen to songs by ${name}`,
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
          <Mic2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
      </div>
      
      <div className="relative -mx-4 px-4">
        <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory scrollbar-hide hover:scrollbar-default">
          {displayItems.map((item) => (
            <div
              key={item.name}
              className="group cursor-pointer flex-shrink-0 w-32 md:w-36 snap-start"
              onClick={() => handleClick(item.name)}
            >
              <div className="relative overflow-hidden rounded-full aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 group-hover:scale-[1.02] shadow-lg hover:shadow-xl border-2 border-primary/10 group-hover:border-primary/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mic2 className="w-12 h-12 text-primary/40" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <button
                  onClick={(e) => handleShare(e, item.name)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                  aria-label={`Share ${item.name}`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 text-center px-1">
                <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {item.description}
                </p>
                <div className="flex flex-wrap justify-center gap-1 mt-1">
                  {item.genres.slice(0, 2).map((genre) => (
                    <span 
                      key={genre} 
                      className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SingersGrid;
