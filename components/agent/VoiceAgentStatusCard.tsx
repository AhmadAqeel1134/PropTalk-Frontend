'use client'

// Component: VoiceAgentStatusCard
// Purpose: Display active voice agent status with real-time indicators and quick actions

import React, { useState } from 'react';
import { Phone, Radio, Settings, TrendingUp, Zap, PhoneCall, MoreVertical } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useVoiceAgent, useToggleVoiceAgentStatus, useCallStatistics } from '@/hooks/useAgent';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

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

interface VoiceAgentStatusCardProps {
  onConfigure?: () => void;
}

export default function VoiceAgentStatusCard({ onConfigure }: VoiceAgentStatusCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();

  const { data: agent, isLoading, error } = useVoiceAgent();
  const { mutate: toggleStatus } = useToggleVoiceAgentStatus();
  const { data: dayStats, isLoading: loadingDay, error: errorDay } = useCallStatistics('day');
  const { data: weekStats, isLoading: loadingWeek, error: errorWeek } = useCallStatistics('week');
  const { data: monthStats, isLoading: loadingMonth, error: errorMonth } = useCallStatistics('month');

  if (isLoading || loadingDay || loadingWeek || loadingMonth) return <LoadingSpinner />;
  if (error || errorDay || errorWeek || errorMonth) return <ErrorMessage message="Failed to load voice agent data" />;
  if (!agent) return null;

  const isActive = agent.status === 'active';
  const totalCalls = monthStats?.total_calls ?? 0;
  const todayCalls = dayStats?.total_calls ?? 0;
  const avgDurationSec = weekStats?.average_duration_seconds ?? 0;
  const avgMinutes = Math.floor(avgDurationSec / 60);
  const avgSeconds = Math.round(avgDurationSec % 60);
  const successRate = weekStats && weekStats.total_calls > 0
    ? Math.round((weekStats.completed_calls / weekStats.total_calls) * 1000) / 10
    : 0;

  return (
    <div className="relative">
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 hover:border-gray-700 transition-all duration-500">

        <div className="relative z-10 p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`relative p-4 rounded-2xl ${isActive ? 'bg-gray-800/80 border border-gray-700' : 'bg-gray-800 border border-gray-700'} backdrop-blur-sm transition-all duration-300`}>
                <Phone className={isActive ? 'text-gray-100' : 'text-gray-400'} size={28} />
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
            <button
              className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2"
              onClick={() => {
                setShowMenu(false);
                onConfigure?.();
              }}
            >
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
                   ? 'rgba(64, 64, 72, 0.6)' 
                   : 'rgba(107, 114, 128, 0.1)',
                 border: isActive 
                   ? '1px solid rgba(107, 114, 128, 0.5)' 
                   : '1px solid rgba(107, 114, 128, 0.3)'
               }}>
            <Radio className={isActive ? 'text-gray-200' : 'text-gray-400'} size={16} />
            <span className={`text-sm font-medium ${isActive ? 'text-gray-100' : 'text-gray-400'}`}>
              {isActive ? 'Active & Listening' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 group/stat">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Calls (30d)</span>
                <PhoneCall className="text-blue-400 opacity-50 group-hover/stat:opacity-100 transition-opacity" size={16} />
              </div>
              <p className="text-2xl font-bold text-white">{totalCalls.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 group/stat">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Today</span>
                <Zap className="text-yellow-400 opacity-50 group-hover/stat:opacity-100 transition-opacity" size={16} />
              </div>
              <p className="text-2xl font-bold text-white">{todayCalls}</p>
              <span className="text-xs text-gray-500">Last 24 hours</span>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 group/stat">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Avg Duration (7d)</span>
              </div>
              <p className="text-2xl font-bold text-white">{avgMinutes}m {avgSeconds}s</p>
              <span className="text-xs text-gray-500">Per call</span>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 group/stat">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Success Rate (7d)</span>
              </div>
              <p className="text-2xl font-bold text-white">{successRate}%</p>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 border border-gray-700">
                <div
                  className="h-1.5 rounded-full bg-gray-500 transition-all duration-300"
                  style={{ width: `${successRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => toggleStatus(isActive ? 'inactive' : 'active')}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white"
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
            
            <button
              className="flex-1 px-6 py-3 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800 font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
              onClick={onConfigure}
            >
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

