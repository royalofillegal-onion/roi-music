import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.442d38d7e72549babbcf689c58024a1f',
  appName: 'ROI Music',
  webDir: 'dist',
  server: {
    url: 'https://442d38d7-e725-49ba-bbcf-689c58024a1f.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;