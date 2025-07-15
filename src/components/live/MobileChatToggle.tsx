
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
    <div className="fixed top-20 right-4 z-40 md:hidden">
      <Button
        onClick={onToggle}
        className={`
          relative bg-music-accent hover:bg-music-accent/80 text-black
          ${isOpen ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
        `}
        size="sm"
      >
        {isOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <>
            <MessageCircle className="h-4 w-4" />
            {messagesCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {messagesCount > 99 ? '99+' : messagesCount}
              </span>
            )}
          </>
        )}
      </Button>
    </div>
  );
};

export default MobileChatToggle;
