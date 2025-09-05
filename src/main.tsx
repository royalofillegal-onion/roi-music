
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

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </React.StrictMode>
);
