import React from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
}

export function VoiceVisualizer({ isActive }: VoiceVisualizerProps) {
  return (
    <div className="flex items-center justify-center py-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm">
      <div className="flex items-center space-x-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full transition-all duration-300 ${
              isActive ? 'animate-pulse' : ''
            }`}
            style={{
              height: isActive ? `${Math.random() * 40 + 10}px` : '4px',
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`
            }}
          />
        ))}
      </div>
      <div className="ml-4 text-white/80 text-sm">
        {isActive ? 'Listening...' : 'Voice mode active'}
      </div>
    </div>
  );
}