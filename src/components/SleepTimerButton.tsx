import React, { useState, useEffect } from 'react';
import { Moon, Clock, Music, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSleepTimer } from '@/hooks/useSleepTimer';
import { cn } from '@/lib/utils';

const TIME_PRESETS = [5, 10, 15, 30, 45, 60, 90, 120];
const SONG_PRESETS = [1, 3, 5, 10, 15, 20];

export function SleepTimerButton() {
  const { isActive, remaining, mode, startTimer, startSongCounter, stopTimer, extendTimer } = useSleepTimer();
  const [isOpen, setIsOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [customSongs, setCustomSongs] = useState(5);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative transition-colors",
            isActive && "text-primary"
          )}
        >
          <Moon className="h-5 w-5" />
          {isActive && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="rounded-t-3xl bg-background/95 backdrop-blur-xl border-t border-border/50">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Moon className="h-5 w-5" />
            Sleep Timer
          </SheetTitle>
        </SheetHeader>

        {isActive ? (
          <div className="space-y-6 pb-8">
            <div className="text-center py-8 bg-primary/10 rounded-2xl">
              <p className="text-sm text-muted-foreground mb-2">
                {mode === 'time' ? 'Time remaining' : 'Songs remaining'}
              </p>
              <p className="text-4xl font-bold text-primary">{remaining}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => extendTimer(5)}
              >
                <Plus className="h-4 w-4 mr-2" />
                +5 min
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => extendTimer(15)}
              >
                <Plus className="h-4 w-4 mr-2" />
                +15 min
              </Button>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                stopTimer();
                setIsOpen(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Timer
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="time" className="pb-8">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </TabsTrigger>
              <TabsTrigger value="songs" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Songs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="time" className="space-y-6">
              <div className="grid grid-cols-4 gap-2">
                {TIME_PRESETS.map((mins) => (
                  <Button
                    key={mins}
                    variant="outline"
                    className="h-12"
                    onClick={() => {
                      startTimer(mins);
                      setIsOpen(false);
                    }}
                  >
                    {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Custom time</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCustomMinutes(Math.max(1, customMinutes - 5))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold">{customMinutes}</span>
                    <span className="text-muted-foreground ml-1">min</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCustomMinutes(customMinutes + 5)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    startTimer(customMinutes);
                    setIsOpen(false);
                  }}
                >
                  Start Timer
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="songs" className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {SONG_PRESETS.map((count) => (
                  <Button
                    key={count}
                    variant="outline"
                    className="h-12"
                    onClick={() => {
                      startSongCounter(count);
                      setIsOpen(false);
                    }}
                  >
                    {count} {count === 1 ? 'song' : 'songs'}
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Custom songs</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCustomSongs(Math.max(1, customSongs - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold">{customSongs}</span>
                    <span className="text-muted-foreground ml-1">songs</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCustomSongs(customSongs + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    startSongCounter(customSongs);
                    setIsOpen(false);
                  }}
                >
                  Start Timer
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
