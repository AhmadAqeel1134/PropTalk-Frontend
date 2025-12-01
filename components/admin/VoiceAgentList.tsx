'use client'

// Component: VoiceAgentList (Admin)
// Purpose: Admin view of all active voice agents with stats

import React, { useState } from 'react';
import { 
  Search, Phone, Radio, User, Mail, TrendingUp, 
  Eye, BarChart3, CheckCircle, XCircle 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface VoiceAgent {
  id: string;
  real_estate_agent_id: string;
  phone_number: string | null;
  name: string;
  status: 'active' | 'inactive' | 'pending_setup';
  created_at: string;
  agent_name?: string;
  agent_email?: string;
  stats?: {
    total_calls: number;
    calls_today: number;
  };
}

export default function VoiceAgentList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: agents, isLoading } = useQuery<VoiceAgent[]>({
    queryKey: ['voice-agents-admin'],
    queryFn: async () => {
      const { getAllVoiceAgents } = await import('@/lib/api');
      const data = await getAllVoiceAgents();
      return data.items || [];
    }
  });

  const filteredAgents = agents?.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agent_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone_number?.includes(searchTerm)
  );

  const stats = {
    total: agents?.length || 0,
    active: agents?.filter(a => a.status === 'active').length || 0,
    inactive: agents?.filter(a => a.status === 'inactive').length || 0,
    totalCalls: agents?.reduce((sum, a) => sum + (a.stats?.total_calls || 0), 0) || 0
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <Phone className="text-blue-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.total}</p>
          <p className="text-sm text-gray-400">Total Agents</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <Radio className="text-green-400" size={24} />
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.active}</p>
          <p className="text-sm text-gray-400">Active</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/20">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="text-gray-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.inactive}</p>
          <p className="text-sm text-gray-400">Inactive</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-purple-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.totalCalls.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Total Calls</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by agent name, email, or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {filteredAgents && filteredAgents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent, index) => (
            <div
              key={agent.id}
              className="group relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              {agent.status === 'active' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
              )}
              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      agent.status === 'active' 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-gray-800 border border-gray-700'
                    }`}>
                      <Phone className={agent.status === 'active' ? 'text-green-400' : 'text-gray-400'} size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{agent.name}</h3>
                      <p className="text-gray-400 text-xs font-mono">{agent.phone_number}</p>
                    </div>
                  </div>
                  {agent.status === 'active' && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs text-green-400">Live</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <User size={14} />
                    <span>{agent.agent_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail size={14} />
                    <span className="truncate">{agent.agent_email || 'N/A'}</span>
                  </div>
                </div>

                {agent.stats && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">Total Calls</p>
                      <p className="text-lg font-bold text-white">{agent.stats.total_calls}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">Today</p>
                      <p className="text-lg font-bold text-white">{agent.stats.calls_today}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 rounded-lg bg-blue-600/10 border border-blue-600/30 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 font-medium transition-all group/btn text-sm">
                    <span className="flex items-center justify-center gap-2">
                      <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                      Details
                    </span>
                  </button>
                  <button className="flex-1 px-4 py-2 rounded-lg bg-purple-600/10 border border-purple-600/30 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300 font-medium transition-all group/btn text-sm">
                    <span className="flex items-center justify-center gap-2">
                      <BarChart3 size={16} className="group-hover/btn:scale-110 transition-transform" />
                      Stats
                    </span>
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Created {new Date(agent.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAgents?.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 border border-gray-700 mb-4">
            <Phone className="text-gray-500" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No voice agents found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm ? 'Try adjusting your search' : 'No voice agents have been created yet'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white transition-all"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

