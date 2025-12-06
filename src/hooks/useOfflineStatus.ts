import { useState, useEffect, useCallback } from 'react';
import { offlineCacheService } from '@/services/OfflineCacheService';

interface OfflineStatus {
  isOnline: boolean;
  isOfflineReady: boolean;
  cachedSongCount: number;
  cacheSize: string;
}

export function useOfflineStatus() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isOfflineReady: false,
    cachedSongCount: 0,
    cacheSize: '0 MB'
  });

  const formatSize = (bytes: number): string => {
    if (bytes >= 1073741824) {
      return `${(bytes / 1073741824).toFixed(1)} GB`;
    }
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const refreshCacheStats = useCallback(async () => {
    const stats = await offlineCacheService.getCacheStats();
    setStatus(prev => ({
      ...prev,
      isOfflineReady: stats.count > 0,
      cachedSongCount: stats.count,
      cacheSize: formatSize(stats.totalSize)
    }));
  }, []);

  useEffect(() => {
    const initCache = async () => {
      await offlineCacheService.initialize();
      await refreshCacheStats();
    };
    
    initCache();

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshCacheStats]);

  return { ...status, refreshCacheStats };
}
