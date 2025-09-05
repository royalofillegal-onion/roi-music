// Content protection utilities to prevent copying, dragging, and downloading

export const initializeContentProtection = () => {
  // Skip content protection in development mode to avoid interfering with HMR
  if (import.meta.env.DEV) {
    console.log('Content protection disabled in development mode');
    return;
  }

  // Prevent right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Prevent drag and drop
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Prevent text selection with keyboard shortcuts (less aggressive)
  document.addEventListener('keydown', (e) => {
    // Only prevent basic copy/paste, allow dev tools in development
    if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a')) {
      e.preventDefault();
      return false;
    }
  });

  // Prevent image saving on mobile
  document.addEventListener('touchstart', (e) => {
    if (e.target instanceof HTMLImageElement) {
      e.preventDefault();
    }
  });

  // Prevent long press on images (mobile)
  document.addEventListener('touchend', (e) => {
    if (e.target instanceof HTMLImageElement) {
      e.preventDefault();
    }
  });

  // Disable print screen
  document.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen') {
      navigator.clipboard.writeText('');
      console.log('Screenshots are not allowed!');
    }
  });
};

// Function to make specific elements interactive (like buttons with images)
export const makeElementInteractive = (element: HTMLElement) => {
  element.classList.add('interactive');
};