
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create OneSignal script element
function loadOneSignalScript() {
  const script = document.createElement('script');
  script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
  script.async = true;
  document.head.appendChild(script);
  
  // Initialize OneSignal window object as an empty array first
  window.OneSignal = window.OneSignal || [];
}

// Load OneSignal script
loadOneSignalScript();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
