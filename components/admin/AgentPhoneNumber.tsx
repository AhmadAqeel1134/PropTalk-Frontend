'use client';

import React, { useState } from 'react';
import { useAgentPhoneNumber } from '@/hooks/useAdmin';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import {
  Phone,
  ArrowLeft,
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  Calendar,
  Hash,
  PhoneCall,
} from 'lucide-react';

interface AgentPhoneNumberProps {
  agentId: string;
  agentName?: string;
  onBack?: () => void;
}

const AgentPhoneNumber: React.FC<AgentPhoneNumberProps> = ({ agentId, agentName, onBack }) => {
  const { data: phoneNumber, isLoading, error, refetch } = useAgentPhoneNumber(agentId);
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = () => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber.twilio_phone_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading phone number..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message || 'Failed to load phone number'}
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background: 'rgba(10, 15, 25, 0.95)',
      }}
    >
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 mb-4 text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold">Back</span>
            </button>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-5xl md:text-6xl font-bold text-white mb-4"
                style={{
                  textShadow: '0 0 30px rgba(77, 184, 255, 0.4)',
                }}
              >
                Phone Number
              </h1>
              <p className="text-2xl text-blue-300">
                {agentName && `${agentName} • `}
                Twilio Integration
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="p-3 rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                background: 'rgba(59, 158, 255, 0.1)',
                border: '1px solid rgba(77, 184, 255, 0.3)',
              }}
            >
              <RefreshCw size={20} className="text-blue-400" />
            </button>
          </div>
        </div>

        {/* Phone Number Display or Empty State */}
        {!phoneNumber ? (
          <div
            className="rounded-2xl p-12 backdrop-blur-sm text-center"
            style={{
              background: 'rgba(15, 31, 58, 0.7)',
              border: '1px solid rgba(77, 184, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Phone
              size={64}
              className="text-blue-400 mx-auto mb-6"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(77, 184, 255, 0.4))',
              }}
            />
            <h2 className="text-3xl font-bold text-white mb-4">
              No Phone Number Assigned
            </h2>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              This agent doesn't have a Twilio phone number assigned yet. Contact the system 
              administrator to provision a phone number for this agent.
            </p>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-12">
              <div
                className="p-6 rounded-lg text-left"
                style={{
                  background: 'rgba(59, 158, 255, 0.05)',
                  border: '1px solid rgba(77, 184, 255, 0.2)',
                }}
              >
                <PhoneCall size={32} className="text-blue-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Twilio Integration</h3>
                <p className="text-sm text-blue-300">
                  Phone numbers are provisioned through Twilio for call tracking and management
                </p>
              </div>
              <div
                className="p-6 rounded-lg text-left"
                style={{
                  background: 'rgba(59, 158, 255, 0.05)',
                  border: '1px solid rgba(77, 184, 255, 0.2)',
                }}
              >
                <Phone size={32} className="text-blue-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Professional Numbers</h3>
                <p className="text-sm text-blue-300">
                  Each agent can have a dedicated business line for client communications
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-12 backdrop-blur-sm"
            style={{
              background: 'rgba(15, 31, 58, 0.7)',
              border: '1px solid rgba(77, 184, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Phone Number Display */}
            <div className="text-center mb-12">
              <Phone
                size={48}
                className="text-blue-400 mx-auto mb-6"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(77, 184, 255, 0.4))',
                }}
              />
              <h2
                className="text-6xl md:text-7xl font-bold text-white mb-6"
                style={{
                  textShadow: '0 0 30px rgba(77, 184, 255, 0.4)',
                  letterSpacing: '0.05em',
                }}
              >
                {phoneNumber.twilio_phone_number}
              </h2>

              {/* Status Badge */}
              <div className="flex items-center justify-center mb-8">
                <div
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full text-lg font-semibold ${
                    phoneNumber.is_active ? 'text-green-400' : 'text-red-400'
                  }`}
                  style={{
                    background: phoneNumber.is_active
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    border: phoneNumber.is_active
                      ? '1px solid rgba(34, 197, 94, 0.3)'
                      : '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  {phoneNumber.is_active ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                  <span>{phoneNumber.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyNumber}
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)',
                  boxShadow: '0 4px 20px rgba(59, 158, 255, 0.4)',
                }}
              >
                {copied ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={20} />
                    <span>Copy Number</span>
                  </>
                )}
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Twilio SID */}
              <div
                className="p-6 rounded-lg"
                style={{
                  background: 'rgba(59, 158, 255, 0.05)',
                  border: '1px solid rgba(77, 184, 255, 0.2)',
                }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Hash size={20} className="text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-300">Twilio SID</h3>
                </div>
                <p className="text-white font-mono text-sm break-all">
                  {phoneNumber.twilio_sid}
                </p>
              </div>

              {/* Created Date */}
              <div
                className="p-6 rounded-lg"
                style={{
                  background: 'rgba(59, 158, 255, 0.05)',
                  border: '1px solid rgba(77, 184, 255, 0.2)',
                }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar size={20} className="text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-300">Created</h3>
                </div>
                <p className="text-white font-medium">
                  {new Date(phoneNumber.created_at).toLocaleString()}
                </p>
              </div>

              {/* Updated Date */}
              <div
                className="p-6 rounded-lg"
                style={{
                  background: 'rgba(59, 158, 255, 0.05)',
                  border: '1px solid rgba(77, 184, 255, 0.2)',
                }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar size={20} className="text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-300">Last Updated</h3>
                </div>
                <p className="text-white font-medium">
                  {new Date(phoneNumber.updated_at).toLocaleString()}
                </p>
              </div>

              {/* Agent ID */}
              <div
                className="p-6 rounded-lg"
                style={{
                  background: 'rgba(59, 158, 255, 0.05)',
                  border: '1px solid rgba(77, 184, 255, 0.2)',
                }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Hash size={20} className="text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-300">Agent ID</h3>
                </div>
                <p className="text-white font-mono text-sm">
                  {phoneNumber.real_estate_agent_id}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div
              className="mt-8 p-6 rounded-lg"
              style={{
                background: 'rgba(59, 158, 255, 0.05)',
                border: '1px solid rgba(77, 184, 255, 0.2)',
              }}
            >
              <p className="text-center text-blue-200 text-sm">
                This phone number is managed through Twilio and can be used for call tracking, 
                SMS messaging, and other communication features
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPhoneNumber;

