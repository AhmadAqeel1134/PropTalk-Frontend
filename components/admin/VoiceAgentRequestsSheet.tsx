'use client';

import React from 'react';
import { X, Radio } from 'lucide-react';
import VoiceAgentRequestList from './VoiceAgentRequestList';

interface VoiceAgentRequestsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceAgentRequestsSheet: React.FC<VoiceAgentRequestsSheetProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Side Sheet - Opens from right, aligns with verification sheet styling */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-900 border-l border-gray-800 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(10, 15, 25, 0.95)',
          width: 'calc(100vw - 300px)',
          minWidth: '600px',
          maxWidth: '1600px',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={22} className="text-gray-300" />
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Voice Agent Requests
                </h2>
                <p className="text-sm text-gray-400">
                  Review and manage pending, approved, and rejected requests.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white transition-all duration-200"
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


