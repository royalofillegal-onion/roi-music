// Content protection utilities to prevent copying, dragging, and downloading

export const initializeContentProtection = () => {
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

  // Prevent text selection with keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Prevent Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+S, Ctrl+P, F12, etc.
    if (
      (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 's' || e.key === 'p')) ||
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.shiftKey && e.key === 'C') ||
      (e.ctrlKey && e.key === 'U')
    ) {
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

  // Additional protection against developer tools
  let devtools = { open: false, orientation: null };
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160) {
      if (!devtools.open) {
        devtools.open = true;
        console.clear();
        console.log('%cContent is protected!', 'color: red; font-size: 30px; font-weight: bold;');
      }
    } else {
      devtools.open = false;
    }
  }, 500);

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