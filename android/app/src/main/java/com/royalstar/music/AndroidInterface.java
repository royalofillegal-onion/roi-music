package com.royalstar.music;

import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;
import android.webkit.JavascriptInterface;

/**
 * Interface between WebView and Android
 */
public class AndroidInterface {
    private static final String TAG = "AndroidInterface";
    private final Context context;
    private final MediaNotificationService mediaService;
    private boolean backgroundPlaybackEnabled = false;
    private Handler mainHandler;
    private WebViewCallback callback;
    private PowerManager.WakeLock wakeLock;

    public interface WebViewCallback {
        void onMediaControl(String action);
    }

    public AndroidInterface(Context context, WebViewCallback callback) {
        this.context = context;
        this.callback = callback;
        this.mediaService = new MediaNotificationService();
        this.mainHandler = new Handler(Looper.getMainLooper());
        
        // Initialize wake lock for keeping screen on during playback
        PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "RoyalStarMusic:PlaybackWakeLock");
        wakeLock.setReferenceCounted(false);
        
        // Start the media service
        context.startService(new Intent(context, MediaNotificationService.class));
    }

    @JavascriptInterface
    public void showNotification(String title, String message, String imageUrl, int isPlaying) {
        Log.d(TAG, "showNotification: " + title + ", " + message);
        mediaService.updateNotification(title, message, imageUrl, isPlaying == 1);
    }

    @JavascriptInterface
    public void cancelNotification() {
        Log.d(TAG, "cancelNotification");
        mediaService.cancelNotification();
    }

    @JavascriptInterface
    public void updatePlaybackState(int isPlaying) {
        Log.d(TAG, "updatePlaybackState: " + isPlaying);
        mediaService.updatePlaybackState(isPlaying == 1);
    }

    @JavascriptInterface
    public void onSongCompleted() {
        Log.d(TAG, "onSongCompleted");
        // If in background, send message to WebView to play next song
        if (backgroundPlaybackEnabled) {
            mainHandler.post(() -> {
                if (callback != null) {
                    callback.onMediaControl("next");
                }
            });
        }
    }

    @JavascriptInterface
    public int isBackgroundPlaybackEnabled() {
        return backgroundPlaybackEnabled ? 1 : 0;
    }

    @JavascriptInterface
    public void requestBackgroundPlayback() {
        Log.d(TAG, "requestBackgroundPlayback");
        backgroundPlaybackEnabled = true;
    }

    @JavascriptInterface
    public void disableBackgroundPlayback() {
        Log.d(TAG, "disableBackgroundPlayback");
        backgroundPlaybackEnabled = false;
        if (wakeLock.isHeld()) {
            wakeLock.release();
        }
    }
    
    @JavascriptInterface
    public void keepAwake() {
        Log.d(TAG, "keepAwake - acquiring wake lock");
        if (!wakeLock.isHeld()) {
            wakeLock.acquire(3 * 60 * 60 * 1000L); // Acquire for 3 hours max
        }
    }
    
    @JavascriptInterface
    public void allowSleep() {
        Log.d(TAG, "allowSleep - releasing wake lock");
        if (wakeLock.isHeld()) {
            wakeLock.release();
        }
    }
    
    /**
     * Called when the app is being destroyed
     */
    public void cleanup() {
        // Release wake lock if held
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        
        context.stopService(new Intent(context, MediaNotificationService.class));
        callback = null;
    }
}
