package com.royalstar.music;

import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Handler;
import android.os.IBinder;
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
    private WebViewCallback callback;
    private PowerManager.WakeLock wakeLock;
    private PowerManager.WakeLock cpuWakeLock;
    private boolean backgroundPlaybackEnabled = false;
    private Handler mainHandler;
    
    // Service connection for MediaNotificationService
    private MediaNotificationService mediaService;
    private boolean isBound = false;
    private final ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            MediaNotificationService.LocalBinder binder = (MediaNotificationService.LocalBinder) service;
            mediaService = binder.getService();
            isBound = true;
            Log.d(TAG, "Service bound successfully");
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            mediaService = null;
            isBound = false;
            Log.d(TAG, "Service unbound");
            
            // Try to rebind if playback is still enabled
            if (backgroundPlaybackEnabled) {
                bindMediaService();
            }
        }
    };

    public interface WebViewCallback {
        void onMediaControl(String action);
    }

    public AndroidInterface(Context context, WebViewCallback callback) {
        this.context = context;
        this.callback = callback;
        this.mainHandler = new Handler(Looper.getMainLooper());
        
        // Initialize wake locks for keeping device awake during playback
        PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        
        // Wake lock for keeping CPU running
        cpuWakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "RoyalStarMusic:PlaybackCpuLock");
        cpuWakeLock.setReferenceCounted(false);
        
        // Wake lock that can be held longer
        wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "RoyalStarMusic:PlaybackWakeLock");
        wakeLock.setReferenceCounted(false);
        
        // Initialize and bind to the media service
        initContinuousPlayback();
    }

    @JavascriptInterface
    public void initContinuousPlayback() {
        Log.d(TAG, "Initializing continuous playback system");
        backgroundPlaybackEnabled = true;
        
        // Start the background service
        Intent serviceIntent = new Intent(context, MediaNotificationService.class);
        context.startForegroundService(serviceIntent);
        
        // Bind to service for better control
        bindMediaService();
        
        // Acquire CPU wake lock for continuous processing
        if (!cpuWakeLock.isHeld()) {
            cpuWakeLock.acquire(8 * 60 * 60 * 1000L); // 8 hours max
        }
    }
    
    private void bindMediaService() {
        if (!isBound) {
            Intent intent = new Intent(context, MediaNotificationService.class);
            context.bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
            Log.d(TAG, "Attempting to bind to media service");
        }
    }
    
    @JavascriptInterface
    public void startForegroundService() {
        Log.d(TAG, "Starting foreground service");
        
        // Ensure service is running in foreground
        Intent serviceIntent = new Intent(context, MediaNotificationService.class);
        serviceIntent.setAction("START_FOREGROUND");
        context.startForegroundService(serviceIntent);
        
        // Make sure we're bound to the service
        if (!isBound) {
            bindMediaService();
        }
    }

    @JavascriptInterface
    public void showNotification(String title, String message, String imageUrl, int isPlaying) {
        Log.d(TAG, "showNotification: " + title + ", " + message);
        
        // Ensure service is running
        initContinuousPlayback();
        startForegroundService();
        
        // Update notification through service
        if (isBound && mediaService != null) {
            mediaService.updateNotification(title, message, imageUrl, isPlaying == 1);
        } else {
            // If not bound yet, start service directly
            Intent intent = new Intent(context, MediaNotificationService.class);
            intent.setAction("UPDATE_NOTIFICATION");
            intent.putExtra("title", title);
            intent.putExtra("message", message);
            intent.putExtra("imageUrl", imageUrl);
            intent.putExtra("isPlaying", isPlaying == 1);
            context.startForegroundService(intent);
            
            // Try to bind again
            bindMediaService();
        }
    }

    @JavascriptInterface
    public void cancelNotification() {
        Log.d(TAG, "cancelNotification");
        
        if (isBound && mediaService != null) {
            mediaService.cancelNotification();
        } else {
            Intent intent = new Intent(context, MediaNotificationService.class);
            intent.setAction("CANCEL_NOTIFICATION");
            context.startService(intent);
        }
    }

    @JavascriptInterface
    public void updatePlaybackState(int isPlaying) {
        Log.d(TAG, "updatePlaybackState: " + isPlaying);
        
        // Always ensure service is running
        startForegroundService();
        
        if (isBound && mediaService != null) {
            mediaService.updatePlaybackState(isPlaying == 1);
        } else {
            Intent intent = new Intent(context, MediaNotificationService.class);
            intent.setAction("UPDATE_PLAYBACK");
            intent.putExtra("isPlaying", isPlaying == 1);
            context.startForegroundService(intent);
            
            // Try to bind again
            bindMediaService();
        }
    }

    @JavascriptInterface
    public void onSongCompleted() {
        Log.d(TAG, "onSongCompleted");
        
        // Always ensure service is running
        initContinuousPlayback();
        
        // If in background, send message to WebView to play next song
        if (backgroundPlaybackEnabled) {
            mainHandler.post(() -> {
                if (callback != null) {
                    callback.onMediaControl("next");
                }
            });
            
            // Also trigger through service for redundancy
            if (isBound && mediaService != null) {
                mediaService.onSongCompleted();
            }
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
        
        // Ensure service is running and wake locks are acquired
        initContinuousPlayback();
    }

    @JavascriptInterface
    public void disableBackgroundPlayback() {
        Log.d(TAG, "disableBackgroundPlayback");
        backgroundPlaybackEnabled = false;
        
        // Release wake locks
        if (wakeLock.isHeld()) {
            wakeLock.release();
        }
        
        if (cpuWakeLock.isHeld()) {
            cpuWakeLock.release();
        }
        
        // Stop and unbind service
        if (isBound) {
            try {
                context.unbindService(serviceConnection);
                isBound = false;
            } catch (Exception e) {
                Log.e(TAG, "Error unbinding service", e);
            }
        }
        
        // Stop service
        context.stopService(new Intent(context, MediaNotificationService.class));
    }
    
    @JavascriptInterface
    public void keepAwake() {
        Log.d(TAG, "keepAwake - acquiring wake lock");
        
        // Ensure continuous playback is initialized
        initContinuousPlayback();
        
        // Use the longer-term wake lock
        if (!wakeLock.isHeld()) {
            wakeLock.acquire(8 * 60 * 60 * 1000L); // Acquire for 8 hours max
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
        // Release all wake locks
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        
        if (cpuWakeLock != null && cpuWakeLock.isHeld()) {
            cpuWakeLock.release();
        }
        
        // Unbind from service
        if (isBound) {
            try {
                context.unbindService(serviceConnection);
                isBound = false;
            } catch (Exception e) {
                Log.e(TAG, "Error unbinding service during cleanup", e);
            }
        }
        
        callback = null;
    }
    
    // Check if service is running
    private boolean isServiceRunning(Class<?> serviceClass) {
        ActivityManager manager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (serviceClass.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }
}
