
import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Send, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Song } from '@/data/songs';
import { SongUrlGenerator } from '@/utils/songUrlGenerator';

interface ShareSongProps {
  song: Song;
  className?: string;
}

const ShareSong: React.FC<ShareSongProps> = ({ song, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateShareUrl = async () => {
    if (shareUrl) return; // Already generated
    
    setIsGenerating(true);
    try {
      const url = await SongUrlGenerator.createShareLink(song);
      setShareUrl(url);
    } catch (error) {
      toast.error('Failed to generate share link');
      console.error('Error generating share link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!shareUrl) {
      await handleGenerateShareUrl();
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Unique song URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) {
      await handleGenerateShareUrl();
    }

    if (navigator.share && shareUrl) {
      try {
        await navigator.share({
          title: `${song.title} - ${song.artist}`,
          text: `🎵 Listen to this amazing song on ROI MUSIC!`,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleSocialShare = async (platform: string) => {
    if (!shareUrl) {
      await handleGenerateShareUrl();
    }

    const shareText = await SongUrlGenerator.generateShareText(song);
    let shareLink = '';
    
    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🎵 ${song.title} by ${song.artist}`)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(`Check out ${song.title} by ${song.artist}`)}&body=${encodeURIComponent(shareText)}`;
        break;
      case 'sms':
        shareLink = `sms:?body=${encodeURIComponent(shareText)}`;
        break;
    }
    
    if (shareLink) {
      if (platform === 'email' || platform === 'sms') {
        window.location.href = shareLink;
      } else {
        window.open(shareLink, '_blank', 'noopener,noreferrer');
      }
      setIsOpen(false);
    }
  };

  // Generate share URL when dialog opens
  React.useEffect(() => {
    if (isOpen && !shareUrl && !isGenerating) {
      handleGenerateShareUrl();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={`text-gray-400 hover:text-white ${className}`}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-400">Share Song</DialogTitle>
          <DialogDescription className="text-gray-400">
            Share "{song.title}" by {song.artist} with a unique URL
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Song Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">{song.title}</h4>
              <p className="text-gray-400 truncate text-sm">{song.artist}</p>
            </div>
          </div>

          {/* Unique Share URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Unique Song URL</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                value={isGenerating ? 'Generating unique URL...' : shareUrl}
                readOnly
                className="bg-gray-800 border-gray-600 text-white text-xs flex-1 min-w-0"
                disabled={isGenerating}
              />
              <Button
                onClick={handleCopyUrl}
                size="sm"
                className="bg-green-600 hover:bg-green-700 shrink-0 w-full sm:w-auto"
                disabled={isGenerating}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    <span className="sm:hidden">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    <span className="sm:hidden">Copy URL</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 break-words">
              Anyone with this link can listen to this song on ROI MUSIC
            </p>
          </div>

          {/* Quick Share Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Share Via</label>
            
            {/* Native Share (if supported) */}
            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isGenerating}
              >
                <Send className="h-4 w-4 mr-2" />
                Share via Device
              </Button>
            )}

            {/* Social Media & Communication Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={() => handleSocialShare('whatsapp')}
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white text-xs justify-start"
                disabled={isGenerating}
              >
                <MessageCircle className="h-3 w-3 mr-2" />
                WhatsApp
              </Button>
              
              <Button
                onClick={() => handleSocialShare('telegram')}
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-600 hover:text-white text-xs justify-start"
                disabled={isGenerating}
              >
                <Send className="h-3 w-3 mr-2" />
                Telegram
              </Button>
              
              <Button
                onClick={() => handleSocialShare('twitter')}
                variant="outline"
                className="border-blue-300 text-blue-300 hover:bg-blue-500 hover:text-white text-xs justify-start"
                disabled={isGenerating}
              >
                <Share2 className="h-3 w-3 mr-2" />
                Twitter
              </Button>
              
              <Button
                onClick={() => handleSocialShare('facebook')}
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white text-xs justify-start"
                disabled={isGenerating}
              >
                <Share2 className="h-3 w-3 mr-2" />
                Facebook
              </Button>

              <Button
                onClick={() => handleSocialShare('email')}
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white text-xs justify-start"
                disabled={isGenerating}
              >
                <Mail className="h-3 w-3 mr-2" />
                Email
              </Button>

              <Button
                onClick={() => handleSocialShare('sms')}
                variant="outline"
                className="border-orange-400 text-orange-400 hover:bg-orange-600 hover:text-white text-xs justify-start"
                disabled={isGenerating}
              >
                <Smartphone className="h-3 w-3 mr-2" />
                SMS
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareSong;
