'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Building,
  FileText,
  Contact,
  Phone,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import type { AgentWithStats } from '@/types/admin.types';

interface AgentCardProps {
  agent: AgentWithStats;
  onViewDetails?: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onViewDetails }) => {
  const router = useRouter();
  const { theme } = useTheme();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(agent.id);
    } else {
      router.push(`/admin/agents/${agent.id}`);
    }
  };

  return (
    <div
      className={`rounded-xl p-6 border-2 transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl cursor-pointer flex flex-col justify-between h-full min-h-[280px] backdrop-blur-sm group ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50 hover:shadow-black/30 hover:border-gray-500 hover:bg-gray-800/80'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 hover:shadow-blue-100/50 hover:border-blue-400 hover:bg-white shadow-sm'
      }`}
      onClick={handleViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-2.5 rounded-xl border flex-shrink-0 ${
                theme === 'dark'
                  ? 'bg-gray-800/80 border-gray-700/50 text-gray-300'
                  : 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
              }`}
            >
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {agent.full_name}
              </h3>
              <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {agent.email}
              </p>
            </div>
          </div>
          {agent.company_name && (
            <p className={`text-sm mb-3 truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {agent.company_name}
            </p>
          )}
        </div>
        <ArrowRight
          size={18}
          className={`flex-shrink-0 ml-2 group-hover:translate-x-1 transition-all duration-300 ${
            theme === 'dark'
              ? 'text-gray-400 group-hover:text-white'
              : 'text-gray-500 group-hover:text-gray-900'
          }`}
        />
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            agent.is_active 
              ? theme === 'dark'
                ? 'text-green-400 bg-green-500/10 border border-green-500/30'
                : 'text-green-700 bg-green-100 border border-green-300'
              : theme === 'dark'
              ? 'text-red-400 bg-red-500/10 border border-red-500/30'
              : 'text-red-700 bg-red-100 border border-red-300'
          }`}
        >
          {agent.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
          <span>{agent.is_active ? 'Active' : 'Inactive'}</span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            agent.is_verified 
              ? theme === 'dark'
                ? 'text-green-400 bg-green-500/10 border border-green-500/30'
                : 'text-green-700 bg-green-100 border border-green-300'
              : theme === 'dark'
              ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
              : 'text-blue-700 bg-blue-100 border border-blue-300'
          }`}
        >
          {agent.is_verified ? <CheckCircle size={12} /> : <XCircle size={12} />}
          <span>{agent.is_verified ? 'Verified' : 'Unverified'}</span>
        </div>
      </div>

      {/* Stats */}
      {agent.stats && (
        <div
          className={`grid grid-cols-2 gap-4 pt-5 border-t mt-auto ${
            theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border-gray-700/30'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Building size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Properties
              </p>
              <p className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {agent.stats.properties_count}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border-gray-700/30'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <FileText size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Documents
              </p>
              <p className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {agent.stats.documents_count}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border-gray-700/30'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Contact size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Contacts
              </p>
              <p className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {agent.stats.contacts_count}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg border ${
                agent.stats.has_phone_number
                  ? theme === 'dark'
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-green-100 border-green-300'
                  : theme === 'dark'
                  ? 'bg-gray-800/60 border-gray-700/30'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Phone
                size={14}
                className={
              agent.stats.has_phone_number 
                    ? theme === 'dark'
                      ? 'text-green-400'
                      : 'text-green-600'
                    : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }
              />
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Phone
              </p>
              <p className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {agent.stats.has_phone_number ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCard;

