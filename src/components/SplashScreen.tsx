
import React, { useEffect, useState } from "react";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [lineWidth, setLineWidth] = useState(0);
  
  useEffect(() => {
    // Start line animation
    const timer1 = setTimeout(() => {
      setLineWidth(100);
    }, 200);
    
    // Complete splash screen after animation finishes
    const timer2 = setTimeout(() => {
      onFinish();
    }, 2000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);
  
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center z-50 bg-black">
      {/* Logo */}
      <div className="w-24 h-24 rounded-full overflow-hidden mb-8 shadow-[0_0_15px_#9b87f5] animate-pulse">
        <img 
          src="https://res.cloudinary.com/dkhbceri0/image/upload/v1746935837/WhatsApp_Image_2025-05-11_at_9.25.57_AM_cfrtmn.jpg" 
          alt="RoyalStar Logo"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Star and line */}
      <div className="flex items-center">
        <div className="w-6 h-6 mr-3 text-music-accent animate-pulse">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.9 6.6L22 9.3l-5 4.9 1.2 7.8L12 18.6l-6.2 3.4L7 14.2 2 9.3l7.1-0.7z"/>
          </svg>
        </div>
        
        <div className="relative h-1 w-40 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-music-accent rounded-full transition-all duration-1500 ease-out"
            style={{ width: `${lineWidth}%` }}
          ></div>
        </div>
        
        <div className="w-6 h-6 ml-3 text-music-accent animate-pulse">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.9 6.6L22 9.3l-5 4.9 1.2 7.8L12 18.6l-6.2 3.4L7 14.2 2 9.3l7.1-0.7z"/>
          </svg>
        </div>
      </div>
      
      {/* Text */}
      <p className="mt-8 text-xl font-bold text-white animate-fade-in">
        ROI MUSIC
      </p>
      <p className="mt-2 text-sm text-gray-400 animate-fade-in">
        Loading your music...
      </p>
    </div>
  );
};

export default SplashScreen;
