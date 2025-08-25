
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PlayerProvider } from './context/PlayerContext'
import { permissionManager } from './services/PermissionManager'
import { brandingService } from './services/BrandingService'

// Initialize app permissions and device tracking
const initializeApp = async () => {
  console.log('🚀 Initializing ROI MUSIC App...');
  
  // Initialize branding first
  brandingService.initializeBranding();
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }

  // Request all permissions
  await permissionManager.requestAllPermissions();
  
  // Collect device information
  await permissionManager.collectDeviceInfo();
  
  // Start activity tracking
  await permissionManager.trackUserActivity();
  
  console.log('✅ ROI MUSIC App initialized successfully');
};

// Initialize on app start
initializeApp();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </React.StrictMode>
);
