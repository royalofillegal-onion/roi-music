import React, { useState } from 'react';
import { useDynamicContent, useUserInteractions } from '@/hooks/useDynamicContent';
import { usePlayer } from '@/context/PlayerContext';
import { Song } from '@/data/songs';
import { uniqueSongs, trendingSongs, popularSongs, newReleases } from '@/data/allSongs';
import DynamicSection from './DynamicSection';
import ArtistGrid from './ArtistGrid';
import HeroSection from './HeroSection';
import SectionFullView from './SectionFullView';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Music2, TrendingUp, Heart, Clock } from 'lucide-react';

interface DynamicHomepageProps {
  className?: string;
}

const DynamicHomepage: React.FC<DynamicHomepageProps> = ({ className = '' }) => {
  const { sections, config, loading, error } = useDynamicContent();
  const { trackPlay, trackView } = useUserInteractions();
  const { playSong } = usePlayer();
  
  const [currentFullViewSection, setCurrentFullViewSection] = useState<{
    title: string;
    songs: Song[];
    isOpen: boolean;
  }>({
    title: '',
    songs: [],
    isOpen: false,
  });

  const openSectionFullView = (title: string, songs: Song[]) => {
    trackView('section', 'homepage_section');
    setCurrentFullViewSection({
      title,
      songs,
      isOpen: true,
    });
  };

  const closeSectionFullView = () => {
    setCurrentFullViewSection(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleSongPlay = async (song: Song) => {
    playSong(song);
    await trackPlay(song.id || song.title, {
      source: 'dynamic_homepage',
      timestamp: Date.now()
    });
  };

  // Fallback content mapping
  const getContentForSection = (sectionType: string, sectionConfig: any) => {
    switch (sectionType) {
      case 'trending':
        return trendingSongs.slice(0, sectionConfig?.limit || 10);
      case 'popular':
        return popularSongs.slice(0, sectionConfig?.limit || 10);
      case 'new_releases':
        return newReleases.slice(0, sectionConfig?.limit || 10);
      case 'recommended':
        // Would use personalized content here
        return uniqueSongs
          .filter(song => song.sync === 'happy' || song.sync === 'love')
          .slice(0, sectionConfig?.limit || 10);
      default:
        return uniqueSongs.slice(0, sectionConfig?.limit || 6);
    }
  };

  const renderDynamicSection = (section: any, index: number) => {
    const { section_name, section_type, section_config, content_items } = section;
    
    // Use database content if available, otherwise fallback to static content
    const sectionSongs = content_items && content_items.length > 0 
      ? content_items.map((item: any) => ({
          id: item.id,
          title: item.title,
          artist: item.metadata?.artist || 'Unknown Artist',
          audioUrl: item.media_url || '',
          imageUrl: item.thumbnail_url || '',
          genre: item.metadata?.genre || '',
          duration: item.metadata?.duration || 0,
          sync: item.metadata?.sync || 'happy'
        } as Song))
      : getContentForSection(section_type, section_config);

    const getIcon = () => {
      switch (section_type) {
        case 'trending': return <TrendingUp className="w-5 h-5" />;
        case 'popular': return <Heart className="w-5 h-5" />;
        case 'new_releases': return <Clock className="w-5 h-5" />;
        default: return <Music2 className="w-5 h-5" />;
      }
    };

    const getLayout = () => {
      if (section_config?.layout) return section_config.layout;
      
      switch (section_type) {
        case 'hero': return 'banner';
        case 'slider': return 'horizontal';
        case 'grid': return 'grid';
        case 'featured': return 'list';
        default: return 'list';
      }
    };

    // Hero section special handling
    if (section_type === 'hero') {
      return (
        <div key={section.section_id} className="animate-fade-in">
          <HeroSection className="mb-8" />
        </div>
      );
    }

    // Artists grid special handling
    if (section_type === 'artists' || section_name.toLowerCase().includes('artist')) {
      return (
        <div 
          key={section.section_id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ArtistGrid title={section_name} className="mb-6" />
        </div>
      );
    }

    return (
      <div 
        key={section.section_id}
        className="animate-slide-up hover-scale transition-all duration-300"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <DynamicSection
          title={section_name}
          songs={sectionSongs}
          layout={getLayout()}
          cardSize={section_config?.card_size || 'small'}
          showRankings={section_config?.show_rankings !== false}
          onViewAll={() => openSectionFullView(section_name, sectionSongs)}
          onSongPlay={handleSongPlay}
          className="transition-all duration-300 hover:shadow-bloody"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, cardIndex) => (
                <Skeleton key={cardIndex} className="h-64 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Alert className="border-destructive/50 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load dynamic content. Please refresh the page or contact support.
            <br />
            <span className="text-xs opacity-75">Error: {error}</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 md:space-y-8 lg:space-y-12 ${className}`}>
      {/* Dynamic Site Title */}
      {config.site_title && (
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-fire bg-clip-text text-transparent">
            {config.site_title.replace(/"/g, '')}
          </h1>
        </div>
      )}

      {/* Render all dynamic sections */}
      {sections.map((section, index) => renderDynamicSection(section, index))}
      
      {/* Fallback content if no dynamic sections */}
      {sections.length === 0 && (
        <div className="text-center py-12">
          <Music2 className="w-16 h-16 mx-auto mb-4 text-primary/50" />
          <h2 className="text-xl font-semibold mb-2">Dynamic Content Loading</h2>
          <p className="text-muted-foreground">
            Your personalized music experience is being prepared...
          </p>
        </div>
      )}

      {/* Section Full View */}
      <SectionFullView
        title={currentFullViewSection.title}
        songs={currentFullViewSection.songs}
        isOpen={currentFullViewSection.isOpen}
        onClose={closeSectionFullView}
      />
    </div>
  );
};

export default DynamicHomepage;