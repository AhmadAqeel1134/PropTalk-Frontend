'use client';

import React from 'react';
import { X, Radio } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import VoiceAgentRequestList from './VoiceAgentRequestList';

interface VoiceAgentRequestsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceAgentRequestsSheet: React.FC<VoiceAgentRequestsSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
          }`}
          onClick={onClose}
        />
      )}

      {/* Side Sheet - Opens from right, aligns with verification sheet styling */}
      <div
        className={`fixed top-0 right-0 h-full border-l z-50 transform transition-transform duration-300 ease-out ${
          theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: theme === 'dark' ? 'rgba(10, 15, 25, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          width: 'calc(100vw - 300px)',
          minWidth: '600px',
          maxWidth: '1600px',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-6 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <Radio size={22} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
              <div>
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Voice Agent Requests
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Review and manage pending, approved, and rejected requests.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <VoiceAgentRequestList />
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceAgentRequestsSheet;


