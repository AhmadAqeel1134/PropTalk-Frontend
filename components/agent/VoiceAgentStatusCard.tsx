'use client'

// Component: VoiceAgentStatusCard
// Purpose: Display active voice agent status with real-time indicators and quick actions

import React, { useState } from 'react';
import { Phone, Radio, Settings, TrendingUp, Zap, PhoneCall, MoreVertical } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface VoiceAgent {
  id: string;
  name: string;
  phone_number: string | null;
  status: 'active' | 'inactive' | 'pending_setup';
  settings: {
    voice_gender: 'female' | 'male';
    language: string;
  };
}

interface VoiceAgentStats {
  total_calls: number;
  calls_today: number;
  avg_duration: number;
  success_rate: number;
}

export default function VoiceAgentStatusCard() {
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();

  const { data: agent } = useQuery<VoiceAgent>({
    queryKey: ['voice-agent'],
    queryFn: async () => {
      const { getVoiceAgent } = await import('@/lib/real_estate_agent/api');
      return getVoiceAgent();
    }
  });

  const { data: stats } = useQuery<VoiceAgentStats>({
    queryKey: ['voice-agent-stats'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return {
        total_calls: 1247,
        calls_today: 23,
        avg_duration: 245,
        success_rate: 87.5
      };
    }
  });

  const toggleStatus = useMutation({
    mutationFn: async (newStatus: 'active' | 'inactive') => {
      const { toggleVoiceAgentStatus } = await import('@/lib/real_estate_agent/api');
      return toggleVoiceAgentStatus(newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-agent'] });
    }
  });

  if (!agent) return null;

  const isActive = agent.status === 'active';

  return (
    <div className="relative">
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 hover:border-gray-700 transition-all duration-500">
        {isActive && (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
          </>
        )}

        <div className="relative z-10 p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`relative p-4 rounded-2xl ${isActive ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-800 border border-gray-700'} backdrop-blur-sm transition-all duration-300`}>
                <Phone className={isActive ? 'text-green-400' : 'text-gray-400'} size={28} />
                {isActive && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{agent.name}</h3>
                <p className="text-gray-400 font-mono text-sm">{agent.phone_number}</p>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-gray-900 border border-gray-800 shadow-xl overflow-hidden z-20">
                  <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2">
                    <Settings size={16} />
                    Configure
                  </button>
                  <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2">
                    <TrendingUp size={16} />
                    Analytics
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-sm" 
               style={{ 
                 background: isActive 
                   ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)' 
                   : 'rgba(107, 114, 128, 0.1)',
                 border: isActive 
                   ? '1px solid rgba(34, 197, 94, 0.3)' 
                   : '1px solid rgba(107, 114, 128, 0.3)'
               }}>
            <Radio className={isActive ? 'text-green-400' : 'text-gray-400'} size={16} />
            <span className={`text-sm font-medium ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
              {isActive ? 'Active & Listening' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 group/stat">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Calls</span>
                <PhoneCall className="text-blue-400 opacity-50 group-hover/stat:opacity-100 transition-opacity" size={16} />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.total_calls.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="text-green-400" size={12} />
                <span className="text-xs text-green-400">+12% this week</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 group/stat">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Today</span>
                <Zap className="text-yellow-400 opacity-50 group-hover/stat:opacity-100 transition-opacity" size={16} />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.calls_today}</p>
              <span className="text-xs text-gray-500">Last 24 hours</span>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 group/stat">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold text-white">{Math.floor((stats?.avg_duration || 0) / 60)}m {(stats?.avg_duration || 0) % 60}s</p>
              <span className="text-xs text-gray-500">Per call</span>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 group/stat">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats?.success_rate}%</p>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full" style={{ width: `${stats?.success_rate}%` }}></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => toggleStatus.mutate(isActive ? 'inactive' : 'active')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                isActive 
                  ? 'bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/20'
              }`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
            
            <button className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-blue-500/20">
              <span className="flex items-center justify-center gap-2">
                <Settings size={18} />
                Configure
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

