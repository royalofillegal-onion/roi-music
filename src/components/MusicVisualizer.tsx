
import React, { useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';

const MusicVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying, currentSong } = usePlayer();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#9b87f5');
      gradient.addColorStop(0.5, '#7E69AB');
      gradient.addColorStop(1, '#8B5CF6');
      
      // Draw animated bars
      const barCount = 32;
      const barWidth = width / barCount;
      
      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * height * 0.8 + 20;
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
      }
      
      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isPlaying]);

  if (!isPlaying || !currentSong) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-2 z-50 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={8}
        className="w-full h-full opacity-60"
      />
    </div>
  );
};

export default MusicVisualizer;
