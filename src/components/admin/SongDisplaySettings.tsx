
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Music, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface SongDisplayCounts {
  trending: number;
  popular: number;
  newReleases: number;
  playlists: number;
}

const SongDisplaySettings = () => {
  const [counts, setCounts] = useState<SongDisplayCounts>({
    trending: 6,
    popular: 6,
    newReleases: 6,
    playlists: 4
  });

  const [originalCounts, setOriginalCounts] = useState<SongDisplayCounts>({
    trending: 6,
    popular: 6,
    newReleases: 6,
    playlists: 4
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('royalstar_song_display_counts');
    if (saved) {
      try {
        const parsedCounts = JSON.parse(saved);
        setCounts(parsedCounts);
        setOriginalCounts(parsedCounts);
      } catch (error) {
        console.error('Error loading song display settings:', error);
      }
    }
  }, []);

  const handleCountChange = (section: keyof SongDisplayCounts, value: string) => {
    const numValue = Math.max(1, Math.min(20, parseInt(value) || 1));
    setCounts(prev => ({
      ...prev,
      [section]: numValue
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('royalstar_song_display_counts', JSON.stringify(counts));
      setOriginalCounts(counts);
      toast.success('Song display settings saved successfully!');
      
      // Trigger a custom event to notify components to refresh
      window.dispatchEvent(new CustomEvent('songDisplayCountsUpdated', {
        detail: counts
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleReset = () => {
    const defaultCounts = {
      trending: 6,
      popular: 6,
      newReleases: 6,
      playlists: 4
    };
    setCounts(defaultCounts);
  };

  const hasChanges = JSON.stringify(counts) !== JSON.stringify(originalCounts);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Song Display Settings
        </CardTitle>
        <p className="text-sm text-gray-400">Control how many songs/playlists are shown in each section</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trending">Trending Songs</Label>
            <Input
              id="trending"
              type="number"
              min="1"
              max="20"
              value={counts.trending}
              onChange={(e) => handleCountChange('trending', e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="popular">Popular Songs</Label>
            <Input
              id="popular"
              type="number"
              min="1"
              max="20"
              value={counts.popular}
              onChange={(e) => handleCountChange('popular', e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newReleases">New Releases</Label>
            <Input
              id="newReleases"
              type="number"
              min="1"
              max="20"
              value={counts.newReleases}
              onChange={(e) => handleCountChange('newReleases', e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="playlists">Featured Playlists</Label>
            <Input
              id="playlists"
              type="number"
              min="1"
              max="20"
              value={counts.playlists}
              onChange={(e) => handleCountChange('playlists', e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          
          <Button 
            onClick={handleReset}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongDisplaySettings;
