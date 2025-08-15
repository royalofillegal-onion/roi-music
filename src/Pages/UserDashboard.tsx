
import React from 'react';
import UserInteraction from '@/components/UserInteraction';

const UserDashboard = () => {
  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="text-gray-400">Manage your music experience and connect with the platform</p>
        </div>
        
        <UserInteraction />
      </div>
    </div>
  );
};

export default UserDashboard;
