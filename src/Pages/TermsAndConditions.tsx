
import React, { useState } from 'react';
import { FileText, Share2, Copy, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import PasswordProtection from '@/components/PasswordProtection';

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const copyCurrentPageUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Terms & Conditions page URL copied to clipboard!');
  };

  const shareToSocial = (platform: string) => {
    const url = window.location.href;
    const text = 'Check out RoyalStar Music Terms & Conditions - Open source music platform supporting artists!';
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('RoyalStar Music Terms & Conditions')}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
    }
    
    if (shareUrl) {
      if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <PasswordProtection
        expectedPassword="callme"
        onSuccess={() => setIsAuthenticated(true)}
        title="Terms and Conditions Access"
        description="This page is protected. Please enter the access code."
      />
    );
  }

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={copyCurrentPageUrl}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
            <Button
              onClick={() => shareToSocial('twitter')}
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-green-400">Terms and Conditions</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Understanding our commitment to artists, content creators, and the music community
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Badge className="bg-green-600">Open Source</Badge>
            <Badge className="bg-blue-600">Artist Focused</Badge>
            <Badge className="bg-purple-600">Community Driven</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <ScrollArea className="h-auto">
          <div className="space-y-8">
            {/* Platform Purpose */}
            <div className="bg-green-900/20 p-6 rounded-lg border border-green-700/30">
              <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2 text-xl">
                <Badge className="bg-green-600">Platform Purpose</Badge>
              </h3>
              <p className="text-gray-200 text-base leading-relaxed mb-4">
                <strong>RoyalStar Music</strong> is a free, open source music platform designed exclusively for entertainment, 
                artist promotion, and sponsorship purposes.
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Entertainment and music discovery</li>
                <li>Artist sponsorship and promotion</li>
                <li>Supporting creative professionals</li>
                <li>Building music communities</li>
                <li>Facilitating connections between artists and sponsors</li>
                <li>Connecting fans with their favorite artists</li>
                <li>Promoting music lovers' community engagement</li>
              </ul>
            </div>

            {/* Content Credits */}
            <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-700/30">
              <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2 text-xl">
                <Badge className="bg-blue-600">Content Credits</Badge>
              </h3>
              <div className="bg-green-500/10 p-4 rounded border border-green-500/30 mb-4">
                <p className="text-green-400 font-bold text-lg">
                  ALL CREDITS TO RIGHTFUL OWNERS
                </p>
              </div>
              <p className="text-gray-200 mb-4">
                All audio content, music, lyrics, compositions, and creative works displayed on this platform 
                belong to their respective creators.
              </p>
              <div className="space-y-3">
                <div>
                  <strong className="text-white">Artists & Performers:</strong>
                  <span className="text-gray-300 ml-2">All credits for vocal performances and artistic interpretation</span>
                </div>
                <div>
                  <strong className="text-white">Musicians & Instrumentalists:</strong>
                  <span className="text-gray-300 ml-2">All credits for musical performances and arrangements</span>
                </div>
                <div>
                  <strong className="text-white">Lyricists & Songwriters:</strong>
                  <span className="text-gray-300 ml-2">All credits for lyrics, melodies, and song composition</span>
                </div>
                <div>
                  <strong className="text-white">Composers & Producers:</strong>
                  <span className="text-gray-300 ml-2">All credits for music production, composition, and sound engineering</span>
                </div>
              </div>
            </div>

            {/* Content Removal */}
            <div className="bg-red-900/20 p-6 rounded-lg border border-red-700/30">
              <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2 text-xl">
                <Badge className="bg-red-600">Content Removal Policy</Badge>
              </h3>
              <p className="text-gray-200 mb-4">
                We deeply respect the rights of all content owners, artists, musicians, lyricists, composers, 
                and creative professionals. If you are the owner of any content featured on this platform and:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
                <li>Feel that your content is being used inappropriately</li>
                <li>Believe the presence of your content causes harm to your interests</li>
                <li>Wish to have your content removed for any reason</li>
                <li>Have concerns about how your work is presented</li>
                <li>Want to discuss sponsorship or promotional opportunities</li>
              </ul>
              <div className="bg-green-500/10 p-4 rounded border border-green-500/30">
                <p className="text-green-400 font-bold">
                  We will immediately remove your content upon your request.
                </p>
              </div>
            </div>

            {/* Sharing & Universal Access */}
            <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-700/30">
              <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2 text-xl">
                <Badge className="bg-purple-600">Universal Platform Access</Badge>
              </h3>
              <p className="text-gray-200 mb-4">
                This platform and all its content are designed to work seamlessly across all deployment platforms:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-800/50 p-3 rounded text-center">
                  <strong className="text-white block">Vercel</strong>
                  <span className="text-gray-400 text-sm">vercel.app</span>
                </div>
                <div className="bg-gray-800/50 p-3 rounded text-center">
                  <strong className="text-white block">Netlify</strong>
                  <span className="text-gray-400 text-sm">netlify.app</span>
                </div>
                <div className="bg-gray-800/50 p-3 rounded text-center">
                  <strong className="text-white block">GitHub Pages</strong>
                  <span className="text-gray-400 text-sm">github.io</span>
                </div>
                <div className="bg-gray-800/50 p-3 rounded text-center">
                  <strong className="text-white block">Firebase</strong>
                  <span className="text-gray-400 text-sm">web.app</span>
                </div>
              </div>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Share links work across all platforms automatically</li>
                <li>Dynamic URL generation based on current deployment</li>
                <li>Universal song sharing with platform detection</li>
                <li>Cross-platform compatibility for all features</li>
              </ul>
            </div>

            {/* Open Source */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
              <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2 text-xl">
                <Badge className="bg-green-600">Open Source & Transparency</Badge>
              </h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Source code is freely available and auditable</li>
                <li>Platform exists to promote artists and their work</li>
                <li>No hidden monetization or content ownership claims</li>
                <li>Community-driven development and improvement</li>
                <li>Transparent sponsorship and support mechanisms</li>
                <li>No commercial exploitation of artist content</li>
              </ul>
            </div>

            {/* Share This Page */}
            <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700 text-center">
              <h3 className="text-white font-semibold mb-4">Share These Terms</h3>
              <p className="text-gray-300 mb-4">
                Help spread awareness about our artist-focused, transparent approach to music platforms.
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Button
                  onClick={() => shareToSocial('twitter')}
                  variant="outline"
                  size="sm"
                  className="border-blue-400 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  onClick={() => shareToSocial('facebook')}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-700 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  onClick={() => shareToSocial('linkedin')}
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  onClick={() => shareToSocial('email')}
                  variant="outline"
                  size="sm"
                  className="border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30 text-center">
              <h3 className="text-green-400 font-bold text-2xl mb-3">
                Thank you for supporting artists and creative professionals!
              </h3>
              <p className="text-gray-200 mb-3">
                Together, we celebrate and support the amazing world of music and creativity.
              </p>
              <p className="text-gray-400 text-sm">
                This is a free, open source platform dedicated to artist promotion and music lover community.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TermsAndConditions;
