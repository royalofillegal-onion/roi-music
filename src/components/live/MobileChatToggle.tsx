
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';

interface MobileChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  messagesCount: number;
}

const MobileChatToggle: React.FC<MobileChatToggleProps> = ({ 
  isOpen, 
  onToggle, 
  messagesCount 
}) => {
  return (
    <div className="fixed top-20 right-4 z-40 md:hidden animate-fade-in">
      <Button
        onClick={onToggle}
        className={`
          relative transition-all duration-300 transform hover:scale-110 rounded-full shadow-xl
          ${isOpen 
            ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-red-500/30' 
            : 'bg-gradient-to-r from-music-accent to-music-accent/80 hover:from-music-accent/90 hover:to-music-accent/70 text-black shadow-music-accent/30'
          }
        `}
        size="sm"
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          {isOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <>
              <MessageCircle className="h-4 w-4" />
              {messagesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-5 flex items-center justify-center font-bold shadow-lg animate-bounce border border-white/20">
                  {messagesCount > 99 ? '99+' : messagesCount}
                </span>
              )}
            </>
          )}
        </div>
      </Button>
    </div>
  );
};

export default MobileChatToggle;
