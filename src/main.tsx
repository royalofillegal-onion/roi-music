
// Force React refresh to restart
/// <reference types="vite/client" />

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PlayerProvider } from './context/PlayerContext'
import { initializeContentProtection } from './utils/contentProtection'

// Initialize content protection
initializeContentProtection();

// Request notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (e) {
      console.log('Notification permission request failed:', e);
    }
  }
};

// Register service worker for PWA (only in production, not in iframes)
const registerServiceWorker = async () => {
  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  })();

  const isPreviewHost =
    window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com");

  if (isPreviewHost || isInIframe) {
    // Unregister any existing service workers in preview/iframe contexts
    navigator.serviceWorker?.getRegistrations().then((registrations) => {
      registrations.forEach((r) => r.unregister());
    });
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration.scope);
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  }
};

// Initialize PWA features
requestNotificationPermission();
registerServiceWorker();

// Request persistent storage
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then(granted => {
    if (granted) console.log('Persistent storage granted');
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </React.StrictMode>
);
