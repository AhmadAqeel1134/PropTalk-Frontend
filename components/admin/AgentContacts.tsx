'use client';

import React from 'react';
import { useAgentContacts } from '@/hooks/useAdmin';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Contact, ArrowLeft, Users } from 'lucide-react';

interface AgentContactsProps {
  agentId: string;
  agentName?: string;
  onBack?: () => void;
}

const AgentContacts: React.FC<AgentContactsProps> = ({ agentId, agentName, onBack }) => {
  const { data: contacts, isLoading, error, refetch } = useAgentContacts(agentId);

  if (isLoading) {
    return <LoadingSpinner text="Loading contacts..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message || 'Failed to load contacts'}
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
                Contacts
              </h1>
              <p className="text-2xl text-blue-300">
                {agentName && `${agentName} • `}
                End Users & Contacts
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div
          className="rounded-2xl p-12 backdrop-blur-sm text-center"
          style={{
            background: 'rgba(15, 31, 58, 0.7)',
            border: '1px solid rgba(77, 184, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Contact
            size={64}
            className="text-blue-400 mx-auto mb-6"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(77, 184, 255, 0.4))',
            }}
          />
          <h2 className="text-3xl font-bold text-white mb-4">No Contacts Available</h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Contact management feature is coming soon. Agents will be able to manage their
            end users and contacts here.
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
              <Users size={32} className="text-blue-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Contact Management</h3>
              <p className="text-sm text-blue-300">
                Agents will be able to add, edit, and manage their contacts from uploaded CSV files
              </p>
            </div>
            <div
              className="p-6 rounded-lg text-left"
              style={{
                background: 'rgba(59, 158, 255, 0.05)',
                border: '1px solid rgba(77, 184, 255, 0.2)',
              }}
            >
              <Contact size={32} className="text-blue-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Coming Soon</h3>
              <p className="text-sm text-blue-300">
                This feature will allow agents to organize and call their contacts using the AI receptionist
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentContacts;

