
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ListMusic, Settings, Radio, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
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
    <>
      {isMobile ? (
        // Mobile: Bottom navigation bar
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around py-2 glass-effect border-t border-border h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-accent transition-colors",
                location.pathname === item.path && "text-accent"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      ) : (
        // Desktop: Sidebar with branding
        <div className="fixed top-0 left-0 bottom-0 z-50 w-64 glass-effect border-r border-border flex flex-col">
          {/* Logo/Brand Section */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
                <Music2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ROI MUSIC
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200",
                  location.pathname === item.path && "bg-accent/20 text-accent font-medium shadow-sm"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Footer/Version */}
          <div className="p-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              © 2024 ROI MUSIC
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
