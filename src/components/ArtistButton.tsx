import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtistButtonProps {
  artistName: string;
  imageUrl?: string;
  onClick: (artistName: string) => void;
  className?: string;
}

const ArtistButton = ({ artistName, imageUrl, onClick, className }: ArtistButtonProps) => {
  return (
    <button
      onClick={() => onClick(artistName)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-all duration-200 group w-full text-left",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={artistName}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-accent" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground group-hover:text-accent transition-colors truncate">
          {artistName}
        </h3>
        <p className="text-sm text-muted-foreground">Artist</p>
      </div>
    </button>
  );
};

export default ArtistButton;