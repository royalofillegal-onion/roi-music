
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
        "flex flex-col w-36 md:w-44 group transition-all duration-200 hover:bg-gray-800/50 p-3 rounded-md",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-md shadow-lg mb-2">
        <img 
          src={playlist.coverImage} 
          alt={playlist.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
      </div>
      <div className="mt-1">
        <h3 className="font-medium text-sm truncate">{playlist.title}</h3>
        <p className="text-gray-400 text-xs truncate">{playlist.songs.length} songs</p>
      </div>
    </Link>
  );
};

export default PlaylistCard;
