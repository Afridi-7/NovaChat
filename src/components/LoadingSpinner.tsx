import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-white/20 rounded-full animate-spin`}>
          <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent border-t-white rounded-full animate-spin"></div>
        </div>
        <div className={`absolute inset-0 ${sizeClasses[size]} border border-white/10 rounded-full animate-pulse`}></div>
      </div>
    </div>
  );
}