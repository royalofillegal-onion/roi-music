
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ListMusic, Settings, Radio, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/context/AdminContext";

const Navbar = () => {
  const location = useLocation();
  const { isAdmin } = useAdmin();
  
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
    },
    ...(isAdmin ? [{
      name: "Admin",
      path: "/admin",
      icon: FileText
    }] : [])
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around py-2 glass-effect border-t border-gray-800 h-16 md:h-full md:w-16 md:flex-col md:top-0 md:bottom-0 md:left-0 md:right-auto md:border-t-0 md:border-r md:pt-8">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-music-accent transition-colors",
            location.pathname === item.path && "text-music-accent"
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
