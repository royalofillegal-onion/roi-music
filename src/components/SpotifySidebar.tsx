import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ListMusic, Heart, Radio, Music2, Library, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { playlists } from "@/data/playlists";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

interface SpotifySidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SpotifySidebar = ({ mobileOpen = false, onMobileClose }: SpotifySidebarProps) => {
  const location = useLocation();
  const { open } = useSidebar();
  const isMobile = useIsMobile();
  
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
  
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2" onClick={onMobileClose}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">ROI MUSIC</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="px-3">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive(item.path)
                  ? "bg-white/10 text-white font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <Separator className="my-4 bg-white/10" />

      {/* Library Section */}
      <div className="flex-1 overflow-hidden px-3">
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Your Library
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1 mb-4">
          {libraryItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive(item.path)
                  ? "bg-white/10 text-white font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </div>

        <Separator className="my-4 bg-white/10" />

        {/* Playlists */}
        <div className="px-2 mb-2">
          <span className="text-xs text-gray-400 font-semibold">Playlists</span>
        </div>
        <ScrollArea className="h-[calc(100vh-550px)]">
          <div className="space-y-1">
            {playlists.slice(0, 15).map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                onClick={onMobileClose}
                className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5"
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
          onClick={onMobileClose}
          className="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">U</span>
          </div>
          <span className="text-sm">Settings</span>
        </Link>
      </div>
    </>
  );

  // Mobile: use Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-[280px] bg-black border-white/10 p-0">
          <div className="flex flex-col h-full">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: use Sidebar
  return (
    <Sidebar className="border-r border-white/10" collapsible="icon">
      <SidebarContent className="bg-black">
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            {open && <span className="text-xl font-bold text-white">ROI MUSIC</span>}
          </Link>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.name}
                  >
                    <Link to={item.path} className="gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="bg-white/10" />

        {/* Library Section */}
        <SidebarGroup className="flex-1 overflow-hidden">
          <SidebarGroupLabel className="flex items-center justify-between px-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Your Library
            </span>
            {open && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.name}
                  >
                    <Link to={item.path} className="gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>

          <Separator className="my-2 bg-white/10" />

          {/* Playlists */}
          <SidebarGroupLabel className="px-3">
            {open && <span className="text-xs text-gray-400">Playlists</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="flex-1">
              <SidebarMenu>
                {playlists.slice(0, 10).map((playlist) => (
                  <SidebarMenuItem key={playlist.id}>
                    <SidebarMenuButton asChild tooltip={playlist.title}>
                      <Link to={`/playlist/${playlist.id}`} className="gap-3">
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                          <ListMusic className="h-4 w-4 text-primary" />
                        </div>
                        {open && (
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{playlist.title}</div>
                            <div className="text-xs text-gray-500">Playlist</div>
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">U</span>
            </div>
            {open && <span className="text-sm">Settings</span>}
          </Link>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default SpotifySidebar;
