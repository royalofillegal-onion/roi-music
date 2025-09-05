
import React from 'react';
import { Music, AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SharedSongErrorProps {
  error: string;
  hashCode: string;
  onRetry: () => void;
  onExploreMusic: () => void;
}

const SharedSongError = ({ error, hashCode, onRetry, onExploreMusic }: SharedSongErrorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* ROI MUSIC Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-music-accent rounded-xl flex items-center justify-center shadow-2xl">
            <span className="text-black font-bold text-2xl">ROI</span>
          </div>
          <div className="ml-4">
            <h2 className="text-3xl font-bold text-white">ROI MUSIC</h2>
            <p className="text-music-accent text-sm">Royal of Illegal</p>
          </div>
        </div>

        {/* Error Content */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3">Song Not Found</h1>
            <p className="text-gray-400 mb-6">{error}</p>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Debug Information:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Hash: {hashCode}</p>
              <p>URL: {window.location.href}</p>
              <p>Platform: {window.location.host}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onRetry}
              className="w-full bg-music-accent hover:bg-music-accent/90 text-black font-medium"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={onExploreMusic}
              variant="outline"
              className="w-full border-music-accent/50 text-music-accent hover:bg-music-accent/10"
            >
              <Music className="h-4 w-4 mr-2" />
              Explore Music
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full text-gray-400 hover:text-white"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Music className="h-4 w-4" />
            <span>Discover endless music with ROI MUSIC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedSongError;
