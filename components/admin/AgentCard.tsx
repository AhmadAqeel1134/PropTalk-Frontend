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
import type { AgentWithStats } from '@/types/admin.types';

interface AgentCardProps {
  agent: AgentWithStats;
  onViewDetails?: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onViewDetails }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(agent.id);
    } else {
      router.push(`/admin/agents/${agent.id}`);
    }
  };

  return (
    <div
      className="rounded-lg p-6 bg-gray-900 border border-gray-800 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 hover:border-gray-700 cursor-pointer flex flex-col justify-between h-full min-h-[260px] md:min-h-[280px]"
      onClick={handleViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-gray-800 text-gray-400">
              <User size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">{agent.full_name}</h3>
              <p className="text-sm text-gray-400">{agent.email}</p>
            </div>
          </div>
          {agent.company_name && (
            <p className="text-sm text-gray-500 mb-3">{agent.company_name}</p>
          )}
        </div>
        <ArrowRight size={18} className="text-gray-400 flex-shrink-0" />
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium ${
            agent.is_active ? 'text-green-400 bg-green-400/10 border border-green-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'
          }`}
        >
          {agent.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
          <span>{agent.is_active ? 'Active' : 'Inactive'}</span>
        </div>
        <div
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium ${
            agent.is_verified ? 'text-green-400 bg-green-400/10 border border-green-400/20' : 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20'
          }`}
        >
          {agent.is_verified ? <CheckCircle size={12} /> : <XCircle size={12} />}
          <span>{agent.is_verified ? 'Verified' : 'Unverified'}</span>
        </div>
      </div>

      {/* Stats */}
      {agent.stats && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800 mt-auto">
          <div className="flex items-center space-x-2">
            <Building size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Properties</p>
              <p className="text-base font-semibold text-white">{agent.stats.properties_count}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FileText size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Documents</p>
              <p className="text-base font-semibold text-white">{agent.stats.documents_count}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Contact size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Contacts</p>
              <p className="text-base font-semibold text-white">{agent.stats.contacts_count}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Phone size={16} className={agent.stats.has_phone_number ? 'text-green-400' : 'text-gray-400'} />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-base font-semibold text-white">
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

