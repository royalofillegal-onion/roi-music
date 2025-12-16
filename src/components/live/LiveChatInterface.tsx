import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Users, MessageSquare, X } from 'lucide-react';
import { format } from 'date-fns';

interface Comment {
  id: string;
  user_name: string;
  avatar_url: string;
  content: string;
  created_at: string;
}

interface LiveChatInterfaceProps {
  comments: Comment[];
  newComment: string;
  setNewComment: (comment: string) => void;
  onSendComment: () => void;
  viewerCount: number;
  isLoggedIn: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

const LiveChatInterface: React.FC<LiveChatInterfaceProps> = ({
  comments,
  newComment,
  setNewComment,
  onSendComment,
  viewerCount,
  isLoggedIn,
  isMobile = false,
  onClose
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendComment();
    }
  };

  return (
    <Card className={`${isMobile ? 'h-full' : 'h-96'} flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700 shadow-2xl`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-music-accent" />
            <h3 className="font-bold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Live Chat
            </h3>
          </div>
          <div className="flex items-center space-x-2 bg-green-500/20 rounded-full px-2 py-1">
            <Users className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">{viewerCount}</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        {isMobile && onClose && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-music-accent/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-gray-400 mb-2 font-medium">No messages yet</p>
            <p className="text-gray-500 text-sm">Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment, index) => (
              <div 
                key={comment.id} 
                className="flex space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-music-accent/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img
                    src={comment.avatar_url || '/roi-assets/default-avatar.png'}
                    alt={comment.user_name}
                    className="h-8 w-8 rounded-full border-2 border-music-accent/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-white text-sm">{comment.user_name}</span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(comment.created_at), "HH:mm")}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm break-words">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
        {isLoggedIn ? (
          <div className="flex space-x-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-music-accent rounded-full px-4"
              maxLength={500}
            />
            <Button
              onClick={onSendComment}
              disabled={!newComment.trim()}
              className="bg-gradient-to-r from-music-accent to-music-accent/80 hover:from-music-accent/90 hover:to-music-accent/70 text-black rounded-full px-6 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-gray-400 text-sm mb-2">Please sign in to join the conversation</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-music-accent text-music-accent hover:bg-music-accent hover:text-black rounded-full"
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LiveChatInterface;