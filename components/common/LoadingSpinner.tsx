'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = 'Loading...', 
  fullScreen = false,
  size = 32 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 
        size={size} 
        className="text-blue-400 animate-spin"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(77, 184, 255, 0.5))',
        }}
      />
      {text && (
        <p className="text-blue-300 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center"
        style={{
          background: '#000000',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;

