
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ListMusic, Settings, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: Home
    },
    {
      name: "Search",
      path: "/search",
      icon: Search
    },
    {
      name: "Playlists",
      path: "/playlists",
      icon: ListMusic
    },
    {
      name: "Live",
      path: "/live",
      icon: Radio
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around py-2 glass-effect border-t border-border h-16 md:h-full md:w-16 md:flex-col md:top-0 md:bottom-0 md:left-0 md:right-auto md:border-t-0 md:border-r md:pt-8">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-accent transition-colors",
            location.pathname === item.path && "text-accent"
          )}
        >
          <item.icon className="h-5 w-5 md:h-6 md:w-6" />
          <span className="text-xs mt-1 md:text-[10px]">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default Navbar;
