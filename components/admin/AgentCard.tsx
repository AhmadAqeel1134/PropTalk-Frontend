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
      className="rounded-xl p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-2 border-gray-700/50 transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/30 hover:border-gray-500 hover:bg-gray-800/80 cursor-pointer flex flex-col justify-between h-full min-h-[280px] backdrop-blur-sm group"
      onClick={handleViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gray-800/80 border border-gray-700/50 text-gray-300 flex-shrink-0">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1 truncate">{agent.full_name}</h3>
              <p className="text-sm text-gray-400 truncate">{agent.email}</p>
            </div>
          </div>
          {agent.company_name && (
            <p className="text-sm text-gray-500 mb-3 truncate">{agent.company_name}</p>
          )}
        </div>
        <ArrowRight size={18} className="text-gray-400 flex-shrink-0 ml-2 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            agent.is_active 
              ? 'text-green-400 bg-green-400/10 border border-green-400/20' 
              : 'text-red-400 bg-red-400/10 border border-red-400/20'
          }`}
        >
          {agent.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
          <span>{agent.is_active ? 'Active' : 'Inactive'}</span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            agent.is_verified 
              ? 'text-green-400 bg-green-400/10 border border-green-400/20' 
              : 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20'
          }`}
        >
          {agent.is_verified ? <CheckCircle size={12} /> : <XCircle size={12} />}
          <span>{agent.is_verified ? 'Verified' : 'Unverified'}</span>
        </div>
      </div>

      {/* Stats */}
      {agent.stats && (
        <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-700/50 mt-auto">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gray-800/60 border border-gray-700/30">
              <Building size={14} className="text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Properties</p>
              <p className="text-base font-bold text-white">{agent.stats.properties_count}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gray-800/60 border border-gray-700/30">
              <FileText size={14} className="text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Documents</p>
              <p className="text-base font-bold text-white">{agent.stats.documents_count}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gray-800/60 border border-gray-700/30">
              <Contact size={14} className="text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Contacts</p>
              <p className="text-base font-bold text-white">{agent.stats.contacts_count}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${
              agent.stats.has_phone_number 
                ? 'bg-green-400/10 border-green-400/20' 
                : 'bg-gray-800/60 border-gray-700/30'
            }`}>
              <Phone size={14} className={agent.stats.has_phone_number ? 'text-green-400' : 'text-gray-400'} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Phone</p>
              <p className="text-base font-bold text-white">
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

