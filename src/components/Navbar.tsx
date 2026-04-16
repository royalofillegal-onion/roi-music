
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ListMusic, Settings, Radio, Music2, Menu, X, LayoutGrid, AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebarState } from "@/context/SidebarContext";

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isCollapsed, toggleSidebar } = useSidebarState();
  
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Search", path: "/search", icon: Search },
    { name: "Playlists", path: "/playlists", icon: ListMusic },
    { name: "Live", path: "/live", icon: Radio },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {isMobile ? (
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
        <div 
          className={cn(
            "fixed top-0 left-0 bottom-0 z-50 glass-effect border-r border-border flex flex-col transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Logo/Brand */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className={cn(
                "flex items-center gap-3 overflow-hidden transition-all duration-300",
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              )}>
                <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-primary rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Music2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
                  ROI MUSIC
                </span>
              </div>
              
              <button
                onClick={toggleSidebar}
                className={cn(
                  "p-2 rounded-lg hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
                  isCollapsed && "mx-auto"
                )}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
            </div>
            
            {isCollapsed && (
              <div className="flex justify-center mt-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Music2 className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* View Mode Toggle - Spotify-style (only when expanded) */}
          {!isCollapsed && (
            <div className="px-3 pt-4 pb-2">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-card/40 border border-border/30">
                <button className="flex items-center gap-2 flex-1 px-3 py-2 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20 transition-all">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Tiles
                </button>
                <button className="flex items-center gap-2 flex-1 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all">
                  <AlignJustify className="w-3.5 h-3.5" />
                  Content
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200",
                  location.pathname === item.path && "bg-accent/20 text-accent font-medium shadow-sm",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/50">
            {!isCollapsed && (
              <p className="text-xs text-muted-foreground text-center">
                © 2024 ROI MUSIC
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
