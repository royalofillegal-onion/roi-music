
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TermsAndConditionsProps {
  children: React.ReactNode;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-green-400">
            <FileText className="h-6 w-6" />
            Terms and Conditions
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Understanding our commitment to artists, content creators, and the music community
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Platform Purpose */}
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
              <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-green-600">Platform Purpose</Badge>
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed mb-3">
                <strong>ROI MUSIC</strong> is a free, open source music platform designed exclusively for entertainment, 
                artist promotion, and sponsorship purposes.
              </p>
              <ul className="list-disc pl-5 text-gray-300 space-y-1 text-sm">
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
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
              <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-blue-600">Content Credits</Badge>
              </h3>
              <div className="bg-green-500/10 p-3 rounded border border-green-500/30 mb-3">
                <p className="text-green-400 font-bold text-sm">
                  ALL CREDITS TO RIGHTFUL OWNERS
                </p>
              </div>
              <p className="text-gray-200 text-sm mb-3">
                All audio content, music, lyrics, compositions, and creative works displayed on this platform 
                belong to their respective creators.
              </p>
              <div className="space-y-2 text-sm">
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
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-700/30">
              <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-red-600">Content Removal Policy</Badge>
              </h3>
              <p className="text-gray-200 text-sm mb-3">
                We deeply respect the rights of all content owners, artists, musicians, lyricists, composers, 
                and creative professionals. If you are the owner of any content featured on this platform and:
              </p>
              <ul className="list-disc pl-5 text-gray-300 space-y-1 text-sm mb-3">
                <li>Feel that your content is being used inappropriately</li>
                <li>Believe the presence of your content causes harm to your interests</li>
                <li>Wish to have your content removed for any reason</li>
                <li>Have concerns about how your work is presented</li>
                <li>Want to discuss sponsorship or promotional opportunities</li>
              </ul>
              <div className="bg-green-500/10 p-3 rounded border border-green-500/30">
                <p className="text-green-400 font-bold text-sm">
                  We will immediately remove your content upon your request.
                </p>
              </div>
            </div>

            {/* Open Source */}
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-700/30">
              <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-purple-600">Open Source & Transparency</Badge>
              </h3>
              <ul className="list-disc pl-5 text-gray-300 space-y-1 text-sm">
                <li>Source code is freely available and auditable</li>
                <li>Platform exists to promote artists and their work</li>
                <li>No hidden monetization or content ownership claims</li>
                <li>Community-driven development and improvement</li>
                <li>Transparent sponsorship and support mechanisms</li>
                <li>No commercial exploitation of artist content</li>
              </ul>
            </div>

            {/* Sponsorship */}
            <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-700/30">
              <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-yellow-600">Sponsorship Program</Badge>
              </h3>
              <p className="text-gray-200 text-sm mb-3">
                Our sponsorship program operates with full transparency:
              </p>
              <ul className="list-disc pl-5 text-gray-300 space-y-1 text-sm">
                <li>All sponsorship revenue goes directly to supporting featured artists</li>
                <li>Sponsors support artists through legitimate promotional activities</li>
                <li>Artists benefit from increased exposure and financial support</li>
                <li>Platform facilitates connections but takes no commission</li>
                <li>Complete transparency in all sponsorship arrangements</li>
                <li>Artists maintain full control over their participation</li>
              </ul>
            </div>

            {/* User Responsibilities */}
            <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-700/30">
              <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-indigo-600">User Responsibilities</Badge>
              </h3>
              <p className="text-gray-200 text-sm mb-3">
                By using this platform, you agree to:
              </p>
              <ul className="list-disc pl-5 text-gray-300 space-y-1 text-sm">
                <li>Respect all artists, musicians, lyricists, composers, and creative professionals</li>
                <li>Use the platform for entertainment and artist support purposes only</li>
                <li>Acknowledge that all content belongs to its rightful creators</li>
                <li>Support artists through legitimate means and proper attribution</li>
                <li>Not claim ownership of any content displayed on the platform</li>
                <li>Respect intellectual property rights and copyright laws</li>
                <li>Use the platform responsibly and within legal boundaries</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <h3 className="text-green-400 font-semibold mb-2">Contact & Support</h3>
              <p className="text-gray-300 text-sm mb-3">
                For content removal requests, concerns, or questions about these terms, 
                please use the feedback system available in your profile menu.
              </p>
              <p className="text-green-400 font-bold text-sm">
                We prioritize content owner rights and respond promptly to all requests.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
              <h3 className="text-green-400 font-bold text-lg text-center mb-2">
                Thank you for supporting artists and creative professionals!
              </h3>
              <p className="text-gray-200 text-center text-sm mb-2">
                Together, we celebrate and support the amazing world of music and creativity.
              </p>
              <p className="text-gray-400 text-center text-xs">
                This is a free, open source platform dedicated to artist promotion and music lover community.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditions;
