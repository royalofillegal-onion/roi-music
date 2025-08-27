
import { useState, useEffect } from 'react';
import { maintenanceConfig, isMaintenanceActive, getTimeUntilMaintenance, getTimeUntilMaintenanceEnds } from '@/config/maintenance';

export const useMaintenance = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState(0);
  const [timeUntilEnd, setTimeUntilEnd] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      setIsActive(isMaintenanceActive());
      setTimeUntilStart(getTimeUntilMaintenance());
      setTimeUntilEnd(getTimeUntilMaintenanceEnds());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (milliseconds: number): string => {
    if (milliseconds <= 0) return '00:00:00';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isActive,
    isEnabled: maintenanceConfig.isEnabled,
    config: maintenanceConfig,
    timeUntilStart,
    timeUntilEnd,
    timeUntilStartFormatted: formatTime(timeUntilStart),
    timeUntilEndFormatted: formatTime(timeUntilEnd),
  };
};
