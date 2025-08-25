
export interface AppDeepLinkConfig {
  scheme: string;
  packageName: string;
  iosAppId?: string;
  fallbackUrl?: string;
}

export class AppDeepLinks {
  private static config: AppDeepLinkConfig = {
    scheme: 'roimusic',
    packageName: 'com.roimusic.app',
    iosAppId: '1234567890', // Replace with actual App Store ID
  };

  /**
   * Attempt to open the app with a deep link
   */
  static openApp(path: string, fallbackUrl?: string): void {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    if (isIOS) {
      this.openAppIOS(path, fallbackUrl);
    } else if (isAndroid) {
      this.openAppAndroid(path, fallbackUrl);
    } else {
      this.openAppGeneric(path, fallbackUrl);
    }
  }

  /**
   * Open app on iOS
   */
  private static openAppIOS(path: string, fallbackUrl?: string): void {
    const appUrl = `${this.config.scheme}://${path}`;
    const universalLink = `https://roimusic.netlify.app/app/${path}`;
    
    // Try universal link first
    window.location.href = universalLink;
    
    // Fallback to custom scheme
    setTimeout(() => {
      window.location.href = appUrl;
    }, 100);
    
    // Final fallback to App Store or provided URL
    setTimeout(() => {
      if (fallbackUrl) {
        window.location.href = fallbackUrl;
      } else if (this.config.iosAppId) {
        window.location.href = `https://apps.apple.com/app/id${this.config.iosAppId}`;
      }
    }, 2000);
  }

  /**
   * Open app on Android
   */
  private static openAppAndroid(path: string, fallbackUrl?: string): void {
    const intentUrl = `intent://${path}#Intent;scheme=${this.config.scheme};package=${this.config.packageName};${
      fallbackUrl ? `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};` : ''
    }end`;
    
    window.location.href = intentUrl;
  }

  /**
   * Generic app opening for other platforms
   */
  private static openAppGeneric(path: string, fallbackUrl?: string): void {
    const appUrl = `${this.config.scheme}://${path}`;
    
    // Create hidden iframe to attempt app opening
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = appUrl;
    document.body.appendChild(iframe);
    
    // Clean up iframe after attempt
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      
      // If fallback URL provided and app didn't open, redirect
      if (fallbackUrl && document.visibilityState === 'visible') {
        window.location.href = fallbackUrl;
      }
    }, 1500);
  }

  /**
   * Check if app is likely installed (best effort)
   */
  static async checkAppInstalled(): Promise<boolean> {
    try {
      // This is a best-effort check and may not work on all browsers
      const startTime = Date.now();
      const appUrl = `${this.config.scheme}://check`;
      
      return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appUrl;
        document.body.appendChild(iframe);
        
        const cleanup = () => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        };
        
        // If page becomes hidden quickly, app likely opened
        const visibilityHandler = () => {
          if (document.visibilityState === 'hidden') {
            cleanup();
            resolve(true);
          }
        };
        
        document.addEventListener('visibilitychange', visibilityHandler);
        
        setTimeout(() => {
          document.removeEventListener('visibilitychange', visibilityHandler);
          cleanup();
          resolve(false);
        }, 1000);
      });
    } catch (error) {
      console.error('Error checking app installation:', error);
      return false;
    }
  }
}
