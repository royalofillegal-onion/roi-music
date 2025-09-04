import React, { useState } from 'react';
import { Zap, Heart, Coffee, Focus, TrendingUp, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getSectionsByMood, EnhancedSectionConfig } from '@/utils/enhancedSectionShuffle';

interface MoodBasedSectionSelectorProps {
  onSectionSelect: (section: EnhancedSectionConfig) => void;
  className?: string;
}

const MoodBasedSectionSelector = ({ onSectionSelect, className }: MoodBasedSectionSelectorProps) => {
  const [selectedMood, setSelectedMood] = useState<'energetic' | 'chill' | 'romantic' | 'focus' | null>(null);
  
  const moods = [
    {
      id: 'energetic' as const,
      name: 'Energetic',
      icon: Zap,
      gradient: 'from-orange-500/20 to-red-500/20',
      description: 'High energy vibes'
    },
    {
      id: 'chill' as const,
      name: 'Chill',
      icon: Coffee,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      description: 'Relaxing tunes'
    },
    {
      id: 'romantic' as const,
      name: 'Romantic',
      icon: Heart,
      gradient: 'from-pink-500/20 to-purple-500/20',
      description: 'Love songs'
    },
    {
      id: 'focus' as const,
      name: 'Focus',
      icon: Focus,
      gradient: 'from-green-500/20 to-emerald-500/20',
      description: 'Concentration music'
    }
  ];

  const handleMoodSelect = (moodId: typeof moods[0]['id']) => {
    setSelectedMood(moodId);
    const sections = getSectionsByMood(moodId);
    if (sections.length > 0) {
      onSectionSelect(sections[0]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-foreground">Music for your mood</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          
          return (
            <Button
              key={mood.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => handleMoodSelect(mood.id)}
              className={cn(
                "h-auto p-4 flex flex-col items-center gap-2 bg-gradient-to-br transition-all duration-300 hover:scale-105",
                mood.gradient,
                isSelected ? "border-accent shadow-lg" : "border-border/30 hover:border-accent/50"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 transition-colors",
                isSelected ? "text-accent-foreground" : "text-muted-foreground"
              )} />
              
              <div className="text-center">
                <div className={cn(
                  "font-medium text-sm transition-colors",
                  isSelected ? "text-accent-foreground" : "text-foreground"
                )}>
                  {mood.name}
                </div>
                <div className={cn(
                  "text-xs transition-colors",
                  isSelected ? "text-accent-foreground/70" : "text-muted-foreground"
                )}>
                  {mood.description}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
      
      {selectedMood && (
        <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm text-muted-foreground text-center">
            Great choice! Explore {moods.find(m => m.id === selectedMood)?.name.toLowerCase()} sections above.
          </p>
        </div>
      )}
    </div>
  );
};

export default MoodBasedSectionSelector;