'use client'

// Component: VoiceAgentStatusCard
// Purpose: Display active voice agent status with real-time indicators and quick actions

import React, { useState } from 'react';
import { Phone, Radio, Settings, TrendingUp, Zap, PhoneCall, MoreVertical } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useVoiceAgent, useToggleVoiceAgentStatus, useCallStatistics } from '@/hooks/useAgent';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
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
      <div
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-800 hover:border-gray-700'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-300 shadow-sm'
        }`}
      >
        <div className="relative z-10 p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className={`relative p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-gray-800/80 border-gray-700'
                      : 'bg-blue-50 border-blue-200'
                    : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-100 border-gray-200'
                }`}
              >
                <Phone
                  className={
                    isActive
                      ? theme === 'dark'
                        ? 'text-gray-100'
                        : 'text-blue-600'
                      : theme === 'dark'
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  }
                  size={28}
                />
              </div>
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {agent.name}
                </h3>
                <p className={`font-mono text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {agent.phone_number}
                </p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <MoreVertical size={20} />
              </button>
              {showMenu && (
                <div
                  className={`absolute top-full right-0 mt-2 w-48 rounded-xl border shadow-xl overflow-hidden z-20 ${
                    theme === 'dark'
                      ? 'bg-gray-900 border-gray-800'
                      : 'bg-white border-gray-200 shadow-lg'
                  }`}
                >
                  <button
                    className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => {
                      setShowMenu(false);
                      onConfigure?.();
                    }}
                  >
                    <Settings size={16} />
                    Configure
                  </button>
                  <button
                    className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp size={16} />
                    Analytics
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-sm border ${
              isActive
                ? theme === 'dark'
                  ? 'bg-gray-800/60 border-gray-600/50'
                  : 'bg-blue-50 border-blue-200'
                : theme === 'dark'
                ? 'bg-gray-800/20 border-gray-700/30'
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Radio
              className={
                isActive
                  ? theme === 'dark'
                    ? 'text-gray-200'
                    : 'text-blue-600'
                  : theme === 'dark'
                  ? 'text-gray-400'
                  : 'text-gray-500'
              }
              size={16}
            />
            <span
              className={`text-sm font-medium ${
                isActive
                  ? theme === 'dark'
                    ? 'text-gray-100'
                    : 'text-blue-700'
                  : theme === 'dark'
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }`}
            >
              {isActive ? 'Active & Listening' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div
              className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 group/stat ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Calls (30d)
                </span>
                <PhoneCall
                  className={`opacity-50 group-hover/stat:opacity-100 transition-opacity ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                  size={16}
                />
              </div>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {totalCalls.toLocaleString()}
              </p>
            </div>
            <div
              className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 group/stat ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Today
                </span>
                <Zap
                  className={`opacity-50 group-hover/stat:opacity-100 transition-opacity ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  }`}
                  size={16}
                />
              </div>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {todayCalls}
              </p>
              <span className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Last 24 hours
              </span>
            </div>
            <div
              className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 group/stat ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Avg Duration (7d)
                </span>
              </div>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {avgMinutes}m {avgSeconds}s
              </p>
              <span className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Per call
              </span>
            </div>
            <div
              className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 group/stat ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Success Rate (7d)
                </span>
              </div>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {successRate}%
              </p>
              <div
                className={`w-full rounded-full h-1.5 mt-2 border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-200 border-gray-300'
                }`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gray-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${successRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => toggleStatus(isActive ? 'inactive' : 'active')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                  : 'bg-white border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-700 hover:bg-blue-50 shadow-sm'
              }`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>

            <button
              className={`flex-1 px-6 py-3 rounded-xl border font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-lg ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-sm'
              }`}
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

