
import React from 'react';
import { Loader2, Music } from 'lucide-react';

interface SharedSongLoadingProps {
  hashCode: string;
}

const SharedSongLoading = ({ hashCode }: SharedSongLoadingProps) => {
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

        {/* Loading Content */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
          <div className="mb-6">
            <div className="relative w-16 h-16 bg-music-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="h-8 w-8 text-music-accent" />
              <Loader2 className="h-6 w-6 text-music-accent absolute top-1 right-1 animate-spin" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3">Loading Your Song...</h1>
            <p className="text-gray-400 mb-6">Preparing to play automatically</p>
          </div>

          {/* Loading Status */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-center space-x-2 text-music-accent mb-3">
              <div className="w-2 h-2 bg-music-accent rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-music-accent rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-music-accent rounded-full animate-pulse delay-150"></div>
              <span className="text-sm ml-2">Finding your music</span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Hash: {hashCode}</p>
              <p>Platform: {window.location.host}</p>
            </div>
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

export default SharedSongLoading;
