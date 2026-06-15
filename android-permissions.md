# Android Music App Permissions

After running `npx cap add android`, open `android/app/src/main/AndroidManifest.xml`
and add these inside `<manifest>` (above `<application>`):

```xml
<!-- Audio playback in background -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- Network -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Notifications (Android 13+) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Media access for local audio files (Android 13+ scoped) -->
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
<!-- For Android 12 and below -->
<uses-permission
    android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />

<!-- Bluetooth audio devices (Android 12+) -->
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<!-- Optional: modify audio settings -->
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

## Build steps

1. Export to GitHub, then `git pull` locally.
2. `npm install`
3. `npx cap add android`
4. Edit `android/app/src/main/AndroidManifest.xml` and paste the block above.
5. `npm run build && npx cap sync android`
6. `npx cap run android` (needs Android Studio)

The Media Session API in `src/services/MediaSessionService.ts` already wires
up lockscreen + notification controls (play / pause / next / previous /
seek) and album artwork — this works in both the PWA and the Capacitor
Android build.