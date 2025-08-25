import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9d70eef8c9b14d18a3347ebb5f2dea55',
  appName: 'royalstar-music-verse',
  webDir: 'dist',
  server: {
    url: 'https://9d70eef8-c9b1-4d18-a334-7ebb5f2dea55.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidSpinnerStyle: 'large',
      showSpinner: true,
      spinnerColor: '#9333ea'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#9333ea',
      sound: 'beep.wav'
    },
    BackgroundMode: {
      notificationTitle: 'ROI MUSIC',
      notificationText: 'Music is playing in background',
      enableHighAccuracy: true,
      silent: false
    },
    Permissions: {
      notifications: 'granted',
      microphone: 'granted',
      camera: 'granted',
      geolocation: 'granted',
      storage: 'granted',
      media: 'granted'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_WIFI_STATE',
      'android.permission.WAKE_LOCK',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.CAMERA',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      'android.permission.DISABLE_KEYGUARD',
      'android.permission.BROADCAST_STICKY'
    ]
  },
  ios: {
    scheme: 'ROI MUSIC',
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#000000',
    permissions: [
      'NSMicrophoneUsageDescription',
      'NSCameraUsageDescription',
      'NSLocationWhenInUseUsageDescription',
      'NSLocationAlwaysAndWhenInUseUsageDescription',
      'NSMediaLibraryUsageDescription',
      'NSUserNotificationUsageDescription'
    ]
  }
};

export default config;