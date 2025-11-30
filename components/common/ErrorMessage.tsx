'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry,
  fullScreen = false 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <AlertCircle 
        size={48} 
        className="text-red-400"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))',
        }}
      />
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
        <p className="text-red-300 mb-6 max-w-md">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)',
              boxShadow: '0 4px 20px rgba(59, 158, 255, 0.4)',
            }}
          >
            <RefreshCw size={18} />
            <span>Retry</span>
          </button>
        )}
      </div>
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

  return (
    <div
      className="rounded-2xl p-6 backdrop-blur-sm"
      style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {content}
    </div>
  );
};

export default ErrorMessage;

