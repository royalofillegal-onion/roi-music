import React from 'react';
import { Download, WifiOff, Wifi, HardDrive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { offlineCacheService } from '@/services/OfflineCacheService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline, isOfflineReady, cachedSongCount, cacheSize, refreshCacheStats } = useOfflineStatus();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    await offlineCacheService.clearAllCache();
    await refreshCacheStats();
    setIsClearing(false);
    toast.success('Offline cache cleared');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative transition-colors",
            !isOnline && "text-destructive",
            isOfflineReady && isOnline && "text-primary"
          )}
        >
          {isOnline ? (
            <Wifi className="h-5 w-5" />
          ) : (
            <WifiOff className="h-5 w-5 animate-pulse" />
          )}
          {isOfflineReady && (
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="rounded-t-3xl bg-background/95 backdrop-blur-xl border-t border-border/50">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            Offline Mode
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Connection Status */}
          <div className={cn(
            "p-4 rounded-2xl flex items-center gap-4",
            isOnline ? "bg-green-500/10" : "bg-destructive/10"
          )}>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isOnline ? "bg-green-500/20" : "bg-destructive/20"
            )}>
              {isOnline ? (
                <Wifi className="h-6 w-6 text-green-500" />
              ) : (
                <WifiOff className="h-6 w-6 text-destructive" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {isOnline ? 'Connected' : 'Offline'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isOnline 
                  ? 'Streaming and caching available' 
                  : 'Playing cached songs only'
                }
              </p>
            </div>
          </div>

          {/* Cache Info */}
          <div className="p-4 rounded-2xl bg-muted/50 space-y-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Offline Cache</p>
                <p className="text-sm text-muted-foreground">
                  {cachedSongCount} songs • {cacheSize}
                </p>
              </div>
              <Download className={cn(
                "h-5 w-5",
                isOfflineReady ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            
            <Progress value={(cachedSongCount / 50) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {cachedSongCount}/50 songs cached
            </p>
          </div>

          {/* Info */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Auto-cache enabled:</span>{' '}
              Songs you play are automatically saved for offline listening. 
              Recently played songs are prioritized.
            </p>
          </div>

          {/* Clear Cache Button */}
          {cachedSongCount > 0 && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleClearCache}
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? 'Clearing...' : 'Clear Offline Cache'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
