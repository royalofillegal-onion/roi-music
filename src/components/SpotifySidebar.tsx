import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ListMusic, Heart, Radio, Music2, Library, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { playlists } from "@/data/playlists";

const SpotifySidebar = () => {
  const location = useLocation();
  
  const mainNavItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Search", path: "/search", icon: Search },
    { name: "Library", path: "/playlists", icon: Library },
  ];

  const libraryItems = [
    { name: "Liked Songs", path: "/liked", icon: Heart },
    { name: "Artists", path: "/artists", icon: Music2 },
    { name: "Live Radio", path: "/live", icon: Radio },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-black flex flex-col z-40">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">ROI MUSIC</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-1">
        {mainNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-4 px-3 py-3 rounded-md transition-all duration-200",
              "hover:bg-white/10 text-gray-400 hover:text-white",
              isActive(item.path) && "bg-white/10 text-white font-semibold"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      <Separator className="my-4 bg-white/10" />

      {/* Library Section */}
      <div className="px-3 space-y-1 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Library</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {libraryItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-4 px-3 py-2 rounded-md transition-all duration-200",
              "hover:bg-white/10 text-gray-400 hover:text-white",
              isActive(item.path) && "bg-white/10 text-white font-semibold"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm">{item.name}</span>
          </Link>
        ))}

        <Separator className="my-2 bg-white/10" />

        {/* Playlists */}
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {playlists.slice(0, 10).map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200",
                  "hover:bg-white/10 text-gray-400 hover:text-white group"
                )}
              >
                <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <ListMusic className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{playlist.title}</div>
                  <div className="text-xs text-gray-500">Playlist</div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-xs font-bold text-white">U</span>
          </div>
          <span className="text-sm">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default SpotifySidebar;
