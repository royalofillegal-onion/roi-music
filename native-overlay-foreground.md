# Native Android: Floating Bubble, Foreground Service & Overlay

> The web/PWA layer (this Lovable app) handles smooth background audio,
> Wake Lock (screen-off playback), and the lock-screen / notification media
> controls via the Media Session API. The features below — **a bubble that
> floats over OTHER apps, a true Foreground Service, and surviving app
> removal from Recents** — are **native Android only**. They require the
> Capacitor Android project and the Kotlin/XML below. They cannot run from
> JavaScript.

## What maps to what

| Feature you asked for                         | Where it lives        |
| --------------------------------------------- | --------------------- |
| Keep playing with screen off                  | ✅ Web (Wake Lock + audio) |
| Lock-screen play/pause/next + artwork         | ✅ Web (Media Session) |
| Notification click → open app                 | ✅ Native (launch intent) |
| Floating avatar over other apps               | ⚙️ Native (SYSTEM_ALERT_WINDOW overlay) |
| Foreground Service (survive app close)        | ⚙️ Native service |
| Voice assistant / drag bubble / mini controls | ⚙️ Native overlay UI |

## 1. AndroidManifest.xml permissions

Already added to `android/app/src/main/AndroidManifest.xml` in this project:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
```

## 2. Declare the foreground service (inside `<application>`)

```xml
<service
    android:name=".OverlayMusicService"
    android:exported="false"
    android:foregroundServiceType="mediaPlayback" />
```

## 3. Ask the user for "Display over other apps"

`SYSTEM_ALERT_WINDOW` is a special permission — the user must toggle it in
Settings. From a Capacitor plugin / MainActivity:

```kotlin
import android.provider.Settings
import android.net.Uri

fun ensureOverlayPermission(activity: Activity) {
    if (!Settings.canDrawOverlays(activity)) {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${activity.packageName}")
        )
        activity.startActivity(intent)
    }
}
```

## 4. Foreground service + floating overlay (sketch)

```kotlin
class OverlayMusicService : Service() {
    private lateinit var windowManager: WindowManager
    private var bubble: View? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(1, buildNotification()) // keeps service alive
        showBubble()
        return START_STICKY // restart if killed
    }

    private fun showBubble() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        bubble = LayoutInflater.from(this).inflate(R.layout.floating_bubble, null)
        val params = WindowManager.LayoutParams(
            WRAP_CONTENT, WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )
        // drag handling + tap -> launch app via PendingIntent
        windowManager.addView(bubble, params)
    }

    private fun buildNotification(): Notification {
        val open = PendingIntent.getActivity(
            this, 0,
            packageManager.getLaunchIntentForPackage(packageName),
            PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, "music")
            .setContentTitle("ROI Music")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(open)            // tap notification -> open app
            .setOngoing(true)
            .build()
    }
}
```

`START_STICKY` + `startForeground` is what makes audio **survive app
removal from Recents**. The bubble's tap handler reuses the same launch
`PendingIntent` so tapping it re-opens the app at the player.

## 5. Build steps

1. Export to GitHub, `git pull`, `npm install`.
2. `npx cap add android` (if not added) then `npm run build && npx cap sync android`.
3. Open in Android Studio, add `OverlayMusicService.kt`, `floating_bubble.xml`,
   and a small Capacitor plugin to start/stop the service + request overlay
   permission from JS.
4. `npx cap run android`.
