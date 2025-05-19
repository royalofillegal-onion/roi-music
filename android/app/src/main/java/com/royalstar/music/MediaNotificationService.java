
package com.royalstar.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.IBinder;
import android.support.v4.media.session.MediaSessionCompat;
import android.util.Log;
import android.webkit.WebView;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.io.IOException;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MediaNotificationService extends Service {
    private static final String TAG = "MediaNotificationService";
    private static final String CHANNEL_ID = "media_playback_channel";
    private static final int NOTIFICATION_ID = 1001;

    private NotificationManager notificationManager;
    private MediaSessionCompat mediaSession;
    private ExecutorService executorService;
    private String currentTitle = "";
    private String currentArtist = "";
    private String currentArtUrl = "";
    private boolean isPlaying = false;
    private Bitmap albumArt = null;

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        executorService = Executors.newSingleThreadExecutor();
        createNotificationChannel();
        
        // Create media session for notification controls
        mediaSession = new MediaSessionCompat(this, "RoyalStarMusic");
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
        currentTitle = title;
        currentArtist = artist;
        currentArtUrl = imageUrl;
        isPlaying = playing;
        
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
        showNotification();
    }

    private void showNotification() {
        // Create intent for when user taps notification
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Create media style notification with actions
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(currentTitle)
                .setContentText(currentArtist)
                .setSmallIcon(R.drawable.ic_music_note)
                .setContentIntent(pendingIntent)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setPriority(NotificationCompat.PRIORITY_LOW)
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
        if (isPlaying) {
            builder.setOngoing(true);
        } else {
            builder.setOngoing(false);
        }

        Notification notification = builder.build();
        notificationManager.notify(NOTIFICATION_ID, notification);
        
        // If we're playing, run as foreground service for background playback
        if (isPlaying) {
            startForeground(NOTIFICATION_ID, notification);
        } else {
            stopForeground(false);  // Keep notification visible but not foreground
        }
    }
    
    public void cancelNotification() {
        notificationManager.cancel(NOTIFICATION_ID);
        stopForeground(true);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mediaSession.release();
        executorService.shutdown();
    }
}
