
import React from 'react';
import { Loader2, Music } from 'lucide-react';

interface SharedSongLoadingProps {
  hashCode: string;
}

const SharedSongLoading = ({ hashCode }: SharedSongLoadingProps) => {
  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="h-12 w-12 text-green-400" />
          </div>
          <Loader2 className="h-8 w-8 text-green-400 absolute top-0 right-0 animate-spin" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-white">Loading Your Song...</h1>
        <p className="text-gray-400 mb-4">Preparing to play automatically</p>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Finding your music</span>
          </div>
          <p className="text-gray-500 text-xs">Hash: {hashCode}</p>
          <p className="text-gray-500 text-xs">Platform: {window.location.host}</p>
        </div>
      </div>
    </div>
  );
};

export default SharedSongLoading;
