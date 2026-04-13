
import React from "react";
import { Link } from "react-router-dom";
import { Playlist } from "@/data/playlists";
import { cn } from "@/lib/utils";

interface PlaylistCardProps {
  playlist: Playlist;
  className?: string;
}

const PlaylistCard = ({ playlist, className }: PlaylistCardProps) => {
  return (
    <Link 
      to={`/playlist/${playlist.id}`}
      className={cn(
        "flex flex-col w-36 md:w-44 group transition-all duration-500 p-3 rounded-xl border border-border/20 hover:border-neon-purple/50 hover:shadow-neon-purple hover:bg-neon-purple/5",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg mb-2 ring-1 ring-border/20 group-hover:ring-neon-cyan/40 transition-all duration-500">
        <img 
          src={playlist.coverImage} 
          alt={playlist.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="mt-1">
        <h3 className="font-medium text-sm truncate text-foreground group-hover:text-neon-cyan transition-colors duration-300">{playlist.title}</h3>
        <p className="text-muted-foreground text-xs truncate">{playlist.songs.length} songs</p>
      </div>
    </Link>
  );
};

export default PlaylistCard;
