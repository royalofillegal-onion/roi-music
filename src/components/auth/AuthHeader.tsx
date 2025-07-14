
import React from 'react';
import { User } from 'lucide-react';

const AuthHeader = () => {
  return (
    <div className="text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
        <User className="h-8 w-8 text-music-accent" />
      </div>
      <h2 className="mt-6 text-3xl font-bold tracking-tight">RoyalStar Music</h2>
      <p className="mt-2 text-sm text-gray-400">Sign in to access your music world</p>
    </div>
  );
};

export default AuthHeader;
