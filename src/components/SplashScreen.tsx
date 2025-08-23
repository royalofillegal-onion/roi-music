
import React, { useEffect, useState, useRef } from "react";
import { showAndroidNotification } from "@/services/androidNotification";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [lineWidth, setLineWidth] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    // Enable audio context for mobile devices
    const enableAudioForMobile = () => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.volume = 0.7;
        
        // Try to play immediately
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Loading audio started successfully');
              showAndroidNotification('ROI MUSIC', 'Loading your music experience...');
            })
            .catch(error => {
              console.log('Auto-play blocked, setting up user interaction handler:', error);
              
              // Function to handle first user interaction
              const handleFirstInteraction = () => {
                if (audioRef.current) {
                  audioRef.current.volume = 0.7;
                  audioRef.current.play()
                    .then(() => {
                      console.log('Audio started after user interaction');
                      showAndroidNotification('ROI MUSIC', 'Loading your music experience...');
                    })
                    .catch(e => console.log('Audio play failed:', e));
                }
                
                // Remove listeners after first interaction
                document.removeEventListener('touchstart', handleFirstInteraction);
                document.removeEventListener('click', handleFirstInteraction);
                document.removeEventListener('keydown', handleFirstInteraction);
              };
              
              // Add multiple event listeners for different interaction types
              document.addEventListener('touchstart', handleFirstInteraction);
              document.addEventListener('click', handleFirstInteraction);  
              document.addEventListener('keydown', handleFirstInteraction);
            });
        }
      }
    };

    // Small delay to ensure DOM is ready
    const audioTimer = setTimeout(enableAudioForMobile, 100);
    
    // Start line animation
    // Start line animation
    const timer1 = setTimeout(() => {
      setLineWidth(100);
    }, 200);
    
    // Complete splash screen after animation finishes
    const timer2 = setTimeout(() => {
      onFinish();
    }, 2000);
    
    return () => {
      clearTimeout(audioTimer);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);
  
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center z-50 bg-black">
      {/* Logo with red bloody glow and spinning circle */}
      <div className="relative mb-8">
        {/* Fast spinning circle loader */}
        <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-transparent border-t-red-600 border-r-red-500 animate-spin" style={{
          animation: 'spin 0.5s linear infinite'
        }}></div>
        
        {/* Second spinning circle for more effect */}
        <div className="absolute inset-1 w-28 h-28 rounded-full border-4 border-transparent border-b-red-700 border-l-red-400 animate-spin" style={{
          animation: 'spin 0.7s linear infinite reverse'
        }}></div>
        
        {/* Logo with red bloody glow */}
        <div className="w-24 h-24 rounded-full overflow-hidden relative z-10 m-4" style={{
          boxShadow: `
            0 0 20px #dc2626,
            0 0 40px #b91c1c,
            0 0 60px #991b1b,
            0 0 80px #7f1d1d,
            inset 0 0 20px rgba(220, 38, 38, 0.2)
          `
        }}>
          <img 
            src="https://res.cloudinary.com/dkhbceri0/image/upload/v1746935837/WhatsApp_Image_2025-05-11_at_9.25.57_AM_cfrtmn.jpg" 
            alt="RoyalStar Logo"
            className="w-full h-full object-cover animate-pulse"
            style={{
              filter: 'drop-shadow(0 0 10px #dc2626) saturate(1.2) contrast(1.1)'
            }}
          />
        </div>
        
        {/* Additional pulsing red glow effect */}
        <div 
          className="absolute inset-0 w-32 h-32 rounded-full opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.4) 0%, transparent 70%)',
            animation: 'pulse 1s ease-in-out infinite alternate'
          }}
        ></div>
      </div>
      
      {/* Star and line */}
      <div className="flex items-center">
        <div className="w-6 h-6 mr-3 text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.9 6.6L22 9.3l-5 4.9 1.2 7.8L12 18.6l-6.2 3.4L7 14.2 2 9.3l7.1-0.7z"/>
          </svg>
        </div>
        
        <div className="relative h-1 w-40 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-full transition-all duration-1500 ease-out shadow-[0_0_10px_#dc2626]"
            style={{ width: `${lineWidth}%` }}
          ></div>
        </div>
        
        <div className="w-6 h-6 ml-3 text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.9 6.6L22 9.3l-5 4.9 1.2 7.8L12 18.6l-6.2 3.4L7 14.2 2 9.3l7.1-0.7z"/>
          </svg>
        </div>
      </div>
      
      {/* Text with red glow */}
      <p className="mt-8 text-xl font-bold text-white animate-fade-in drop-shadow-[0_0_6px_rgba(220,38,38,0.6)]">
        ROI MUSIC
      </p>
      <p className="mt-2 text-sm text-gray-400 animate-fade-in">
        Loading your music...
      </p>
      
      {/* Hidden audio element for loading sound */}
      <audio 
        ref={audioRef}
        preload="auto"
        loop
      >
        <source src="https://res.cloudinary.com/dilqrz7sw/video/upload/v1755909215/Retro-Space-Explosion-Or-Death-chosic.com_-_AudioTrimmer.com_jatv98.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default SplashScreen;
