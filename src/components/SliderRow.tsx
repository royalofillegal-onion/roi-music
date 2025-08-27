
import React, { useRef } from "react";
import { ArrowLeft, ArrowRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface SliderRowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onViewAll?: () => void;
  hideArrows?: boolean;
}

const SliderRow = ({ title, children, className, style, onViewAll, hideArrows = false }: SliderRowProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  return (
    <div className={cn("mb-8 w-full", className)} style={style}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="View all songs"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        )}
      </div>
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto whitespace-nowrap gap-4 pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </div>
  );
};

export default SliderRow;
