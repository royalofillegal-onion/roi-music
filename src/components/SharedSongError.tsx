
import React from 'react';
import { Music, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SharedSongErrorProps {
  error: string;
  hashCode: string;
  onRetry: () => void;
  onExploreMusic: () => void;
}

const SharedSongError = ({ error, hashCode, onRetry, onExploreMusic }: SharedSongErrorProps) => {
  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-white">Song Not Found</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <p className="text-gray-500 text-sm mb-2">Debug Info:</p>
          <p className="text-gray-500 text-xs">Hash: {hashCode}</p>
          <p className="text-gray-500 text-xs">URL: {window.location.href}</p>
          <p className="text-gray-500 text-xs">Platform: {window.location.host}</p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={onRetry}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            onClick={onExploreMusic}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:text-white px-6 py-3 rounded-lg w-full"
          >
            <Music className="h-4 w-4 mr-2" />
            Explore Music
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharedSongError;
