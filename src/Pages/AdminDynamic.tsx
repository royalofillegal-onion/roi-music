import React from 'react';
import DynamicContentManager from '@/components/admin/DynamicContentManager';
import { usePlayer } from '@/context/PlayerContext';

const AdminDynamic = () => {
  const { currentSong } = usePlayer();
  
  return (
    <div className={`min-h-screen bg-background ${currentSong ? 'pb-32' : 'pb-16'}`}>
      <DynamicContentManager />
    </div>
  );
};

export default AdminDynamic;