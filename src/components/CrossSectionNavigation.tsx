import React from 'react';
import { ArrowRight, TrendingUp, Music, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedSectionConfig } from '@/utils/enhancedSectionShuffle';

interface CrossSectionNavigationProps {
  currentSection: EnhancedSectionConfig;
  relatedSections: EnhancedSectionConfig[];
  onSectionClick: (sectionId: string) => void;
  className?: string;
}

const CrossSectionNavigation = ({ 
  currentSection, 
  relatedSections, 
  onSectionClick, 
  className 
}: CrossSectionNavigationProps) => {
  const getIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'popular': return <Heart className="w-4 h-4" />;
      case 'massRap': return <Zap className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <h3 className="text-sm font-medium text-muted-foreground">More like this</h3>
      </div>
      
      <div className="space-y-2">
        {relatedSections.slice(0, 3).map((section, index) => (
          <div
            key={section.id}
            className="group cursor-pointer flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-all duration-300 border border-transparent hover:border-accent/20"
            onClick={() => onSectionClick(section.id)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full bg-gradient-to-br transition-transform group-hover:scale-110",
                section.gradient
              )}>
                {getIcon(section.id)}
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground group-hover:text-accent transition-colors">
                  {section.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </div>
            
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          Discover similar vibes across sections
        </p>
      </div>
    </div>
  );
};

export default CrossSectionNavigation;