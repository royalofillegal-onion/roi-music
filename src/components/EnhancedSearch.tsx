
import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { enhancedSongs, searchSongsByQuery as searchEnhancedSongs, searchSongsByCategory as searchEnhancedByCategory } from '@/data/songsData';
import { songs, Song } from '@/data/songs';
import SongCard from '@/components/SongCard';

const categories = ['trending', 'god', 'sad', 'love', 'party', 'workout', 'chill', 'devotional'];
const moods = ['happy', 'sad', 'energetic', 'peaceful', 'romantic', 'spiritual', 'motivational'];

// Search functions for original songs
const searchOriginalSongsByQuery = (query: string): Song[] => {
  const lowerQuery = query.toLowerCase();
  return songs.filter(song =>
    song.title.toLowerCase().includes(lowerQuery) ||
    song.artist.toLowerCase().includes(lowerQuery) ||
    (song.category && song.category.toLowerCase().includes(lowerQuery)) ||
    (song.mood && song.mood.toLowerCase().includes(lowerQuery)) ||
    (song.tags && song.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
};

const searchOriginalSongsByCategory = (category: string): Song[] => {
  return songs.filter(song => 
    (song.category && song.category.toLowerCase().includes(category.toLowerCase())) ||
    (song.mood && song.mood.toLowerCase().includes(category.toLowerCase())) ||
    (song.tags && song.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase())))
  );
};

const EnhancedSearch = () => {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (query || selectedCategories.length > 0 || selectedMoods.length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [query, selectedCategories, selectedMoods]);

  const performSearch = () => {
    let originalResults = songs;
    let enhancedResults = enhancedSongs;

    // Text search
    if (query) {
      originalResults = searchOriginalSongsByQuery(query);
      enhancedResults = searchEnhancedSongs(query);
    }

    // Category filter
    if (selectedCategories.length > 0) {
      originalResults = originalResults.filter(song => 
        (song.category && selectedCategories.includes(song.category)) ||
        (song.tags && selectedCategories.some(cat => song.tags!.includes(cat)))
      );
      enhancedResults = enhancedResults.filter(song => 
        selectedCategories.includes(song.category) ||
        selectedCategories.some(cat => song.tags.includes(cat))
      );
    }

    // Mood filter
    if (selectedMoods.length > 0) {
      originalResults = originalResults.filter(song => 
        song.mood && selectedMoods.includes(song.mood)
      );
      enhancedResults = enhancedResults.filter(song => 
        selectedMoods.includes(song.mood)
      );
    }

    // Convert enhanced songs to Song format and combine results
    const convertedEnhancedResults: Song[] = enhancedResults.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      imageUrl: song.imageUrl,
      audioUrl: song.audioUrl,
      duration: song.duration,
      category: song.category,
      mood: song.mood,
      tags: song.tags
    }));

    // Combine and deduplicate results (in case there are duplicates by ID)
    const allResults = [...originalResults, ...convertedEnhancedResults];
    const uniqueResults = allResults.filter((song, index, self) => 
      index === self.findIndex(s => s.id === song.id)
    );

    setSearchResults(uniqueResults);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedMoods([]);
    setQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song, artist, category, mood, or tags..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-gray-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {(selectedCategories.length > 0 || selectedMoods.length > 0) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {(selectedCategories.length > 0 || selectedMoods.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <Badge
              key={category}
              variant="secondary"
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              {category}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {selectedMoods.map(mood => (
            <Badge
              key={mood}
              variant="secondary"
              className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
              onClick={() => toggleMood(mood)}
            >
              {mood}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className={`cursor-pointer capitalize ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'border-gray-600 hover:border-blue-400'
                    }`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Moods</h3>
              <div className="flex flex-wrap gap-2">
                {moods.map(mood => (
                  <Badge
                    key={mood}
                    variant={selectedMoods.includes(mood) ? "default" : "outline"}
                    className={`cursor-pointer capitalize ${
                      selectedMoods.includes(mood)
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'border-gray-600 hover:border-purple-400'
                    }`}
                    onClick={() => toggleMood(mood)}
                  >
                    {mood}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Search Results ({searchResults.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {searchResults.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {(query || selectedCategories.length > 0 || selectedMoods.length > 0) && searchResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No songs found</h3>
          <p className="text-gray-400">Try adjusting your search criteria or clearing some filters</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
