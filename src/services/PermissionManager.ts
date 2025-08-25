// Comprehensive permission manager for music app functionality

export interface DeviceInfo {
  platform: string;
  userAgent: string;
  language: string;
  timezone: string;
  screenResolution: string;
  batteryLevel?: number;
  networkType?: string;
  deviceMemory?: number;
}

export interface PermissionStatus {
  notifications: NotificationPermission;
  microphone: PermissionState;
  camera: PermissionState;
  geolocation: PermissionState;
  persistentStorage: boolean;
  wakeLock: boolean;
  backgroundSync: boolean;
}

class PermissionManager {
  private permissions: Partial<PermissionStatus> = {};
  private deviceInfo: Partial<DeviceInfo> = {};

  async requestAllPermissions(): Promise<PermissionStatus> {
    console.log('🔐 Requesting comprehensive music app permissions...');

    // Request notification permission
    await this.requestNotificationPermission();
    
    // Request microphone permission (for voice search, etc.)
    await this.requestMicrophonePermission();
    
    // Request camera permission (for QR code scanning, profile pics)
    await this.requestCameraPermission();
    
    // Request geolocation (for location-based recommendations)
    await this.requestGeolocationPermission();
    
    // Request persistent storage
    await this.requestPersistentStorage();
    
    // Request wake lock (keep screen active during playback)
    await this.requestWakeLock();
    
    // Setup background sync
    await this.setupBackgroundSync();

    return this.permissions as PermissionStatus;
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        this.permissions.notifications = permission;
        
        if (permission === 'granted') {
          console.log('✅ Notifications enabled');
          // Show welcome notification
          new Notification('🎵 ROI MUSIC', {
            body: 'Notifications enabled! You\'ll receive updates about new music and features.',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'welcome',
            requireInteraction: false,
            silent: false
          });
        }
        return permission;
      }
    } catch (error) {
      console.log('Notification permission error:', error);
    }
    return 'denied';
  }

  async requestMicrophonePermission(): Promise<PermissionState> {
    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        this.permissions.microphone = result.state;
        
        if (result.state === 'prompt') {
          // Request microphone access
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          this.permissions.microphone = 'granted';
          console.log('✅ Microphone access granted');
        }
        return result.state;
      }
    } catch (error) {
      console.log('Microphone permission error:', error);
    }
    return 'denied';
  }

  async requestCameraPermission(): Promise<PermissionState> {
    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        this.permissions.camera = result.state;
        return result.state;
      }
    } catch (error) {
      console.log('Camera permission error:', error);
    }
    return 'denied';
  }

  async requestGeolocationPermission(): Promise<PermissionState> {
    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        this.permissions.geolocation = result.state;
        
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('✅ Location access granted');
              this.deviceInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            },
            (error) => console.log('Location error:', error)
          );
        }
        return result.state;
      }
    } catch (error) {
      console.log('Geolocation permission error:', error);
    }
    return 'denied';
  }

  async requestPersistentStorage(): Promise<boolean> {
    try {
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const persistent = await navigator.storage.persist();
        this.permissions.persistentStorage = persistent;
        if (persistent) {
          console.log('✅ Persistent storage granted');
        }
        return persistent;
      }
    } catch (error) {
      console.log('Persistent storage error:', error);
    }
    return false;
  }

  async requestWakeLock(): Promise<boolean> {
    try {
      if ('wakeLock' in navigator) {
        const wakeLock = await navigator.wakeLock.request('screen');
        this.permissions.wakeLock = true;
        console.log('✅ Wake lock acquired');
        
        // Handle wake lock release
        wakeLock.addEventListener('release', () => {
          console.log('Wake lock released');
        });
        return true;
      }
    } catch (error) {
      console.log('Wake lock error:', error);
    }
    return false;
  }

  async setupBackgroundSync(): Promise<boolean> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        // Check if sync is supported
        if ('sync' in registration) {
          await (registration as any).sync.register('music-sync');
          this.permissions.backgroundSync = true;
          console.log('✅ Background sync enabled');
          return true;
        }
      }
    } catch (error) {
      console.log('Background sync error:', error);
    }
    return false;
  }

  async collectDeviceInfo(): Promise<DeviceInfo> {
    this.deviceInfo = {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
    };

    // Battery API
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.deviceInfo.batteryLevel = Math.round(battery.level * 100);
      } catch (error) {
        console.log('Battery info not available');
      }
    }

    // Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.deviceInfo.networkType = connection.effectiveType;
    }

    // Device Memory API
    if ('deviceMemory' in navigator) {
      this.deviceInfo.deviceMemory = (navigator as any).deviceMemory;
    }

    console.log('📱 Device info collected:', this.deviceInfo);
    return this.deviceInfo as DeviceInfo;
  }

  getPermissionStatus(): Partial<PermissionStatus> {
    return this.permissions;
  }

  getDeviceInfo(): Partial<DeviceInfo> {
    return this.deviceInfo;
  }

  async trackUserActivity(): Promise<void> {
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      const isVisible = !document.hidden;
      console.log('👁️ Page visibility:', isVisible ? 'visible' : 'hidden');
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PAGE_VISIBILITY',
          isVisible
        });
      }
    });

    // Track online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Connection: online');
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CONNECTION_STATUS',
          isOnline: true
        });
      }
    });

    window.addEventListener('offline', () => {
      console.log('🌐 Connection: offline');
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CONNECTION_STATUS',
          isOnline: false
        });
      }
    });

    // Track battery changes
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        
        battery.addEventListener('chargingchange', () => {
          console.log('🔋 Battery charging:', battery.charging);
        });
        
        battery.addEventListener('levelchange', () => {
          const level = Math.round(battery.level * 100);
          console.log('🔋 Battery level:', level + '%');
          
          // Warn about low battery
          if (level <= 15 && !battery.charging) {
            this.showLowBatteryNotification(level);
          }
        });
      } catch (error) {
        console.log('Battery monitoring not available');
      }
    }
  }

  private showLowBatteryNotification(level: number): void {
    if (this.permissions.notifications === 'granted') {
      new Notification('🔋 Low Battery', {
        body: `Battery at ${level}%. Consider charging your device for uninterrupted music.`,
        icon: '/icon-192x192.png',
        tag: 'low-battery',
        requireInteraction: false
      });
    }
  }
}

export const permissionManager = new PermissionManager();
