
import React, { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SliderRowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SliderRow = ({ title, children, className, style }: SliderRowProps) => {
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
        <div className="flex space-x-2">
          <button 
            onClick={scrollLeft}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Scroll left"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={scrollRight}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Scroll right"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
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
