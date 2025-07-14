
export interface MaintenanceConfig {
  isEnabled: boolean;
  startTime: string; // ISO string
  endTime: string; // ISO string
  message: string;
  title: string;
}

// Calculate current time and 5 hours from now
const now = new Date();
const fiveHoursLater = new Date(now.getTime() + (24 * 60 * 60 * 1000));

export const maintenanceConfig: MaintenanceConfig = {
  isEnabled: true, // Enable maintenance mode
  startTime: now.toISOString(), // Start maintenance now
  endTime: fiveHoursLater.toISOString(), // End after 5 hours
  message: 'We are currently performing scheduled maintenance to improve your experience. We apologize for any inconvenience and will be back online shortly.',
  title: 'Scheduled Maintenance'
};

// Helper function to check if maintenance is currently active
export const isMaintenanceActive = (): boolean => {
  if (!maintenanceConfig.isEnabled) return false;
  
  const now = new Date();
  const start = new Date(maintenanceConfig.startTime);
  const end = new Date(maintenanceConfig.endTime);
  
  return now >= start && now <= end;
};

// Helper function to get time until maintenance starts
export const getTimeUntilMaintenance = (): number => {
  const now = new Date();
  const start = new Date(maintenanceConfig.startTime);
  return start.getTime() - now.getTime();
};

// Helper function to get time until maintenance ends
export const getTimeUntilMaintenanceEnds = (): number => {
  const now = new Date();
  const end = new Date(maintenanceConfig.endTime);
  return end.getTime() - now.getTime();
};
