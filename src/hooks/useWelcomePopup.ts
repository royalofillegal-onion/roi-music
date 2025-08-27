
import { useState, useEffect } from 'react';

export const useWelcomePopup = () => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('royalstar_welcome_seen');
    if (!hasSeenWelcome) {
      // Show welcome popup after a short delay
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('royalstar_welcome_seen', 'true');
  };

  return {
    showWelcome,
    handleCloseWelcome
  };
};
