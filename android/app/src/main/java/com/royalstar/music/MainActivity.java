
package com.royalstar.music;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity implements AndroidInterface.WebViewCallback {
    private static final String TAG = "MainActivity";
    private WebView webView;
    private AndroidInterface androidInterface;
    private BroadcastReceiver mediaReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Set up WebView
        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);  // Allow audio to play without interaction

        // Create and add interface to WebView
        androidInterface = new AndroidInterface(this, this);
        webView.addJavascriptInterface(androidInterface, "AndroidInterface");
        
        // Load the web app
        webView.loadUrl("file:///android_asset/www/index.html");
        
        // Register broadcast receiver for media controls
        registerMediaControlReceiver();
    }

    private void registerMediaControlReceiver() {
        mediaReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                final String action = intent.getAction();
                if (action != null) {
                    switch (action) {
                        case "ACTION_PLAY":
                            callJavascript("window.dispatchEvent(new CustomEvent('android-media-control', { detail: { action: 'play' } }));");
                            break;
                        case "ACTION_PAUSE":
                            callJavascript("window.dispatchEvent(new CustomEvent('android-media-control', { detail: { action: 'pause' } }));");
                            break;
                        case "ACTION_NEXT":
                            callJavascript("window.dispatchEvent(new CustomEvent('android-media-control', { detail: { action: 'next' } }));");
                            break;
                        case "ACTION_PREVIOUS":
                            callJavascript("window.dispatchEvent(new CustomEvent('android-media-control', { detail: { action: 'previous' } }));");
                            break;
                    }
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction("ACTION_PLAY");
        filter.addAction("ACTION_PAUSE");
        filter.addAction("ACTION_NEXT");
        filter.addAction("ACTION_PREVIOUS");
        registerReceiver(mediaReceiver, filter);
    }

    private void callJavascript(final String script) {
        runOnUiThread(() -> webView.evaluateJavascript(script, null));
    }

    @Override
    public void onMediaControl(String action) {
        // Called by AndroidInterface when media control actions happen
        callJavascript("window.dispatchEvent(new CustomEvent('android-media-control', { detail: { action: '" + action + "' } }));");
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (androidInterface != null) {
            androidInterface.cleanup();
        }
        
        if (mediaReceiver != null) {
            unregisterReceiver(mediaReceiver);
        }
    }
}
