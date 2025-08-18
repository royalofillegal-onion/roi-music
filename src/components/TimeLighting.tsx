import React, { useEffect, useState } from 'react';

const TimeLighting: React.FC = () => {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>('day');

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 10) {
        setTimeOfDay('morning');
      } else if (hour >= 10 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getLightingClass = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'lighting-morning';
      case 'day':
        return 'lighting-day';
      case 'evening':
        return 'lighting-evening';
      case 'night':
        return 'lighting-night';
      default:
        return 'lighting-day';
    }
  };

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${getLightingClass()}`}>
      {/* Morning - Soft golden glow */}
      {timeOfDay === 'morning' && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-200/5 via-yellow-100/10 to-transparent" />
      )}
      
      {/* Day - Bright clean lighting */}
      {timeOfDay === 'day' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/5 via-white/5 to-transparent" />
      )}
      
      {/* Evening - Warm sunset tones */}
      {timeOfDay === 'evening' && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-300/8 via-pink-200/6 to-purple-300/4" />
      )}
      
      {/* Night - Deep blues and purples */}
      {timeOfDay === 'night' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/8 to-indigo-900/6" />
      )}
      
      {/* Subtle animated particles */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-white rounded-full animate-pulse lighting-particle-${i + 1}`}
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${10 + (i * 10)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TimeLighting;