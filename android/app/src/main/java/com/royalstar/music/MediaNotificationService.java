package com.royalstar.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.v4.media.session.MediaSessionCompat;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.io.IOException;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class MediaNotificationService extends Service {
    private static final String TAG = "MediaNotificationService";
    private static final String CHANNEL_ID = "media_playback_channel";
    private static final int NOTIFICATION_ID = 1001;

    private NotificationManager notificationManager;
    private MediaSessionCompat mediaSession;
    private ExecutorService executorService;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private boolean hasAudioFocus = false;
    
    private String currentTitle = "";
    private String currentArtist = "";
    private String currentArtUrl = "";
    private boolean isPlaying = false;
    private Bitmap albumArt = null;
    private PowerManager.WakeLock serviceLock;
    
    // Media control broadcast receiver
    private BroadcastReceiver mediaControlReceiver;
    
    // Binder for service connection
    private final IBinder binder = new LocalBinder();
    
    public class LocalBinder extends Binder {
        MediaNotificationService getService() {
            return MediaNotificationService.this;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "MediaNotificationService onCreate");
        
        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        executorService = Executors.newSingleThreadExecutor();
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        
        createNotificationChannel();
        
        // Create media session for notification controls
        mediaSession = new MediaSessionCompat(this, "RoyalStarMusic");
        mediaSession.setActive(true);
        
        // Create partial wake lock for service
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        serviceLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "RoyalStarMusic:ServiceWakeLock");
        serviceLock.setReferenceCounted(false);
        
        // Register broadcast receiver for media controls
        registerMediaControlReceiver();
        
        // Request audio focus
        requestAudioFocus();
        
        // Start as foreground service immediately
        startForegroundWithEmptyNotification();
    }
    
    private void startForegroundWithEmptyNotification() {
        // Create a basic notification to use for foreground service
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("RoyalStar Music")
                .setContentText("Music service running")
                .setSmallIcon(R.drawable.ic_music_note)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOnlyAlertOnce(true)
                .setOngoing(true);
                
        startForeground(NOTIFICATION_ID, builder.build());
    }
    
    private void registerMediaControlReceiver() {
        mediaControlReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                if (action != null) {
                    handleMediaAction(action);
                }
            }
        };
        
        IntentFilter filter = new IntentFilter();
        filter.addAction("ACTION_PLAY");
        filter.addAction("ACTION_PAUSE");
        filter.addAction("ACTION_NEXT");
        filter.addAction("ACTION_PREVIOUS");
        registerReceiver(mediaControlReceiver, filter);
    }
    
    private void handleMediaAction(String action) {
        Log.d(TAG, "Received media action: " + action);
        
        // Send control event back to MainActivity to handle
        Intent mainActivityIntent = new Intent("MEDIA_CONTROL_EVENT");
        mainActivityIntent.putExtra("action", action.replace("ACTION_", "").toLowerCase());
        mainActivityIntent.setPackage(getPackageName());
        sendBroadcast(mainActivityIntent);
        
        // Update our state if needed
        if ("ACTION_PLAY".equals(action)) {
            isPlaying = true;
            updateNotificationControls();
        } else if ("ACTION_PAUSE".equals(action)) {
            isPlaying = false;
            updateNotificationControls();
        }
    }
    
    private void requestAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes playbackAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();
                    
            audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(playbackAttributes)
                    .setAcceptsDelayedFocusGain(true)
                    .setOnAudioFocusChangeListener(focusChange -> {
                        // Handle audio focus changes
                        switch (focusChange) {
                            case AudioManager.AUDIOFOCUS_GAIN:
                                // We have audio focus now
                                hasAudioFocus = true;
                                break;
                            case AudioManager.AUDIOFOCUS_LOSS:
                                // We lost audio focus for an extended time
                                hasAudioFocus = false;
                                // Notify app to pause playback
                                handleMediaAction("ACTION_PAUSE");
                                break;
                        }
                    })
                    .build();
                    
            int result = audioManager.requestAudioFocus(audioFocusRequest);
            hasAudioFocus = result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
            Log.d(TAG, "Audio focus request result: " + (hasAudioFocus ? "granted" : "denied"));
        } else {
            int result = audioManager.requestAudioFocus(
                    focusChange -> {
                        // Handle audio focus changes
                        switch (focusChange) {
                            case AudioManager.AUDIOFOCUS_GAIN:
                                hasAudioFocus = true;
                                break;
                            case AudioManager.AUDIOFOCUS_LOSS:
                                hasAudioFocus = false;
                                handleMediaAction("ACTION_PAUSE");
                                break;
                        }
                    },
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN
            );
            hasAudioFocus = result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Media Playback",
                    NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Shows what's currently playing");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            notificationManager.createNotificationChannel(channel);
        }
    }

    public void updateNotification(String title, String artist, String imageUrl, boolean playing) {
        Log.d(TAG, "Updating notification: " + title + " - " + artist + " - Playing: " + playing);
        
        currentTitle = title;
        currentArtist = artist;
        currentArtUrl = imageUrl;
        isPlaying = playing;
        
        // Acquire wake lock if playing to prevent service from being killed
        if (playing && !serviceLock.isHeld()) {
            serviceLock.acquire(8 * 60 * 60 * 1000L); // Hold for 8 hours max
        } else if (!playing && serviceLock.isHeld()) {
            serviceLock.release();
        }
        
        // Ensure we have audio focus if playing
        if (playing && !hasAudioFocus) {
            requestAudioFocus();
        }
        
        // Load album art in background
        if (imageUrl != null && !imageUrl.isEmpty()) {
            executorService.execute(() -> {
                try {
                    URL url = new URL(imageUrl);
                    albumArt = BitmapFactory.decodeStream(url.openConnection().getInputStream());
                    showNotification();
                } catch (IOException e) {
                    Log.e(TAG, "Error loading album art", e);
                    albumArt = null;
                    showNotification();
                }
            });
        } else {
            showNotification();
        }
    }
    
    public void updatePlaybackState(boolean playing) {
        isPlaying = playing;
        
        // Handle wake lock based on playback state
        if (playing && !serviceLock.isHeld()) {
            serviceLock.acquire(8 * 60 * 60 * 1000L);
        } else if (!playing && serviceLock.isHeld()) {
            serviceLock.release();
        }
        
        // Update audio focus
        if (playing && !hasAudioFocus) {
            requestAudioFocus();
        }
        
        updateNotificationControls();
    }
    
    public void onSongCompleted() {
        Log.d(TAG, "Song completed, attempting to play next");
        
        // Send event to MainActivity to play next song
        Intent mainActivityIntent = new Intent("MEDIA_CONTROL_EVENT");
        mainActivityIntent.putExtra("action", "next");
        mainActivityIntent.setPackage(getPackageName());
        sendBroadcast(mainActivityIntent);
    }
    
    private void updateNotificationControls() {
        // Only update the play/pause button without recreating the whole notification
        showNotification();
    }

    private void showNotification() {
        // Create intent for when user taps notification
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("fromNotification", true);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Create media style notification with actions
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(currentTitle.isEmpty() ? "RoyalStar Music" : currentTitle)
                .setContentText(currentArtist.isEmpty() ? "Music is ready to play" : currentArtist)
                .setSmallIcon(R.drawable.ic_music_note)
                .setContentIntent(pendingIntent)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setPriority(NotificationCompat.PRIORITY_HIGH) // Higher priority for better visibility
                .setOnlyAlertOnce(true);

        // Add album art if available
        if (albumArt != null) {
            builder.setLargeIcon(albumArt);
            
            // Add media style with album art
            androidx.media.app.NotificationCompat.MediaStyle mediaStyle = 
                    new androidx.media.app.NotificationCompat.MediaStyle()
                    .setMediaSession(mediaSession.getSessionToken())
                    .setShowActionsInCompactView(0, 1, 2);
            
            builder.setStyle(mediaStyle);
        }

        // Add media control actions
        // Previous button
        Intent prevIntent = new Intent("ACTION_PREVIOUS");
        PendingIntent prevPendingIntent = PendingIntent.getBroadcast(
                this, 1, prevIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        builder.addAction(R.drawable.ic_previous, "Previous", prevPendingIntent);

        // Play/Pause button
        Intent playPauseIntent = new Intent(isPlaying ? "ACTION_PAUSE" : "ACTION_PLAY");
        PendingIntent playPausePendingIntent = PendingIntent.getBroadcast(
                this, 2, playPauseIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        builder.addAction(isPlaying ? R.drawable.ic_pause : R.drawable.ic_play, 
                isPlaying ? "Pause" : "Play", playPausePendingIntent);

        // Next button
        Intent nextIntent = new Intent("ACTION_NEXT");
        PendingIntent nextPendingIntent = PendingIntent.getBroadcast(
                this, 3, nextIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        builder.addAction(R.drawable.ic_next, "Next", nextPendingIntent);

        // Show the notification and make it ongoing while playing
        builder.setOngoing(true);

        Notification notification = builder.build();
        notificationManager.notify(NOTIFICATION_ID, notification);
        
        // Always running as foreground service for reliable background playback
        startForeground(NOTIFICATION_ID, notification);
    }
    
    public void cancelNotification() {
        // Release wake lock if held
        if (serviceLock.isHeld()) {
            serviceLock.release();
        }
        
        // Cancel notification but keep service running
        notificationManager.cancel(NOTIFICATION_ID);
        
        // Restart with empty notification to keep service alive
        startForegroundWithEmptyNotification();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "onStartCommand: " + (intent != null ? intent.getAction() : "null intent"));
        
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            
            if ("UPDATE_NOTIFICATION".equals(action)) {
                String title = intent.getStringExtra("title");
                String message = intent.getStringExtra("message");
                String imageUrl = intent.getStringExtra("imageUrl");
                boolean isPlaying = intent.getBooleanExtra("isPlaying", false);
                updateNotification(title, message, imageUrl, isPlaying);
            } else if ("UPDATE_PLAYBACK".equals(action)) {
                boolean isPlaying = intent.getBooleanExtra("isPlaying", false);
                updatePlaybackState(isPlaying);
            } else if ("CANCEL_NOTIFICATION".equals(action)) {
                cancelNotification();
            } else if ("START_FOREGROUND".equals(action)) {
                // Just ensure we're in foreground mode
                if (currentTitle.isEmpty()) {
                    startForegroundWithEmptyNotification();
                } else {
                    showNotification();
                }
            }
        }
        
        // Always restart if killed
        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "onDestroy - attempting to restart service");
        
        super.onDestroy();
        
        // Release wake lock if held
        if (serviceLock.isHeld()) {
            serviceLock.release();
        }
        
        // Clean up resources
        mediaSession.release();
        
        // Unregister receiver
        try {
            unregisterReceiver(mediaControlReceiver);
        } catch (Exception e) {
            Log.e(TAG, "Error unregistering receiver", e);
        }
        
        // Abandon audio focus
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (audioFocusRequest != null) {
                audioManager.abandonAudioFocusRequest(audioFocusRequest);
            }
        } else {
            audioManager.abandonAudioFocus(null);
        }
        
        executorService.shutdown();
        
        // Attempt to restart the service
        if (isPlaying) {
            Intent restartService = new Intent(getApplicationContext(), MediaNotificationService.class);
            restartService.setAction("RESTART_SERVICE");
            startService(restartService);
        }
    }
    
    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
        Log.d(TAG, "onTaskRemoved - ensuring service continues running");
        
        // The app has been removed from recents, ensure service continues
        if (isPlaying) {
            // Service might be killed soon, schedule restart
            Intent restartServiceIntent = new Intent(getApplicationContext(), MediaNotificationService.class);
            restartServiceIntent.setPackage(getPackageName());
            PendingIntent restartServicePendingIntent = PendingIntent.getService(
                    getApplicationContext(), 1, restartServiceIntent, PendingIntent.FLAG_IMMUTABLE);
            
            // Schedule restart
            AlarmHelper.scheduleServiceRestart(this, restartServicePendingIntent);
            
            // Also request the app itself to restart in background if needed
            Intent appRestartIntent = new Intent("APP_BACKGROUND_RESTART");
            appRestartIntent.setPackage(getPackageName());
            sendBroadcast(appRestartIntent);
        }
    }
    
    // Helper class to restart service
    public static class AlarmHelper {
        public static void scheduleServiceRestart(Context context, PendingIntent intent) {
            android.app.AlarmManager alarmManager = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                            android.app.AlarmManager.RTC_WAKEUP,
                            System.currentTimeMillis() + 1000,
                            intent
                    );
                } else {
                    alarmManager.set(
                            android.app.AlarmManager.RTC_WAKEUP,
                            System.currentTimeMillis() + 1000,
                            intent
                    );
                }
                Log.d(TAG, "Service restart scheduled via AlarmManager");
            }
        }
    }
}
