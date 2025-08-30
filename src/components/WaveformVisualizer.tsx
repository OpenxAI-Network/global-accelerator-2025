import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface WaveformVisualizerProps {
  waveformData: number[];
  audioLevel: number;
  isListening: boolean;
  className?: string;
  height?: number;
  width?: number;
  barCount?: number;
  barWidth?: number;
  barGap?: number;
  animate?: boolean;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  waveformData,
  audioLevel,
  isListening,
  className,
  height = 60,
  width = 300,
  barCount = 32,
  barWidth = 6,
  barGap = 2,
  animate = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Draw waveform on canvas
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Calculate total width needed for bars
    const totalBarWidth = barCount * (barWidth + barGap) - barGap;
    const startX = (width - totalBarWidth) / 2;

    // Draw bars
    for (let i = 0; i < barCount; i++) {
      const x = startX + i * (barWidth + barGap);
      
      // Get data value for this bar (or use audio level if no data)
      let value = 0;
      if (waveformData.length > 0) {
        const dataIndex = Math.floor((i / barCount) * waveformData.length);
        value = waveformData[dataIndex] || 0;
      } else if (isListening) {
        // Use audio level for real-time visualization
        value = audioLevel;
      }

      // Normalize value to bar height
      const normalizedValue = Math.max(0.1, (value / 255) * height);
      
      // Calculate bar height with some randomness for natural look
      const barHeight = isListening 
        ? normalizedValue * (0.8 + Math.random() * 0.4)
        : normalizedValue;

      // Create gradient for bars
      const gradient = ctx.createLinearGradient(x, height - barHeight, x, height);
      
      if (isListening) {
        // Active listening gradient
        gradient.addColorStop(0, '#3b82f6'); // Blue
        gradient.addColorStop(0.5, '#8b5cf6'); // Purple
        gradient.addColorStop(1, '#06b6d4'); // Cyan
      } else {
        // Inactive gradient
        gradient.addColorStop(0, '#6b7280'); // Gray
        gradient.addColorStop(1, '#9ca3af'); // Light gray
      }

      // Draw bar
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      // Add subtle shadow
      ctx.shadowColor = isListening ? '#3b82f6' : '#6b7280';
      ctx.shadowBlur = isListening ? 8 : 2;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw rounded corners
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth, barHeight, 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    }

    // Add center line indicator
    if (isListening) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Add pulse effect when listening
    if (isListening && animate) {
      const pulseRadius = (audioLevel / 100) * 20 + 10;
      const pulseAlpha = 0.3 - (audioLevel / 100) * 0.2;
      
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, pulseRadius, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(59, 130, 246, ${pulseAlpha})`;
      ctx.fill();
    }
  };

  // Animation loop
  useEffect(() => {
    if (animate && isListening) {
      const animateWaveform = () => {
        drawWaveform();
        animationRef.current = requestAnimationFrame(animateWaveform);
      };
      
      animateWaveform();
    } else {
      drawWaveform();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waveformData, audioLevel, isListening, animate]);

  // Redraw when props change
  useEffect(() => {
    drawWaveform();
  }, [waveformData, audioLevel, isListening]);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Canvas for waveform */}
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg bg-gray-50"
        style={{ width, height }}
      />
      
      {/* Audio level indicator */}
      {isListening && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600">Listening</span>
          </div>
          <div className="text-xs text-gray-500">
            Level: {Math.round(audioLevel)}%
          </div>
        </div>
      )}
      
      {/* Status indicator */}
      <div className="mt-1 text-xs text-gray-500">
        {isListening ? 'Voice input active' : 'Click to start voice command'}
      </div>
    </div>
  );
};

export default WaveformVisualizer;
