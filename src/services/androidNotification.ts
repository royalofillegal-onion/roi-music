// Detect if running inside Android WebView with native interface
export const isAndroidWebView = (): boolean => {
  return /Android/i.test(navigator.userAgent) && typeof (window as any).AndroidInterface !== 'undefined';
};

// Call Android native to show notification
export const showAndroidNotification = (title: string, body?: string) => {
  if (isAndroidWebView()) {
    try {
      (window as any).AndroidInterface.showNotification(title, body || '');
      console.log('Android native notification sent');
    } catch (e) {
      console.error('Error calling AndroidInterface:', e);
    }
  }
};

// Call Android native to cancel notification
export const cancelAndroidNotification = () => {
  if (isAndroidWebView()) {
    try {
      (window as any).AndroidInterface.cancelNotification();
      console.log('Android native notification canceled');
    } catch (e) {
      console.error('Error calling AndroidInterface:', e);
    }
  }
};
