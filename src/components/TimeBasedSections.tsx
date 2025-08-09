import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SongCard from '@/components/SongCard';
import SliderRow from '@/components/SliderRow';
import { getTimeBasedSongs, getTimeBasedGreeting } from '@/utils/dailyRotation';
import { Switch } from '@/components/ui/switch';
import { Clock, Eye, EyeOff } from 'lucide-react';

const TimeBasedSections = () => {
  const [showTimeBasedSections, setShowTimeBasedSections] = useState(true);
  const [timeBasedSongs, setTimeBasedSongs] = useState(getTimeBasedSongs(4));
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());

  useEffect(() => {
    // Update songs and greeting every minute to handle time changes
    const interval = setInterval(() => {
      setTimeBasedSongs(getTimeBasedSongs(4));
      setGreeting(getTimeBasedGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Load toggle state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('showTimeBasedSections');
    if (saved !== null) {
      setShowTimeBasedSections(JSON.parse(saved));
    }
  }, []);

  // Save toggle state to localStorage
  const handleToggle = (checked: boolean) => {
    setShowTimeBasedSections(checked);
    localStorage.setItem('showTimeBasedSections', JSON.stringify(checked));
  };

  return (
    <div className="mb-8">
      {/* Toggle Control */}
      <div className="flex items-center justify-between mb-4 p-3 bg-card/50 rounded-lg border border-border/50">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-music-accent" />
          <div>
            <h3 className="text-sm font-medium">Time-Based Sections</h3>
            <p className="text-xs text-muted-foreground">Show songs based on current time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showTimeBasedSections ? (
            <Eye className="h-4 w-4 text-music-accent" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
          <Switch
            checked={showTimeBasedSections}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-music-accent"
          />
        </div>
      </div>

      {/* Time-Based Songs Section */}
      {showTimeBasedSections && timeBasedSongs.length > 0 && (
        <SliderRow 
          title={greeting} 
          className="animate-slide-up"
          style={{animationDelay: "150ms"}}
        >
          <div className="flex gap-4">
            {timeBasedSongs.map((song) => (
              <SongCard 
                key={song.id} 
                song={song} 
                className="min-w-[180px] w-[180px]" 
              />
            ))}
          </div>
        </SliderRow>
      )}
    </div>
  );
};

export default TimeBasedSections;