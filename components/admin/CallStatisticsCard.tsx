'use client'

// Component: CallStatisticsCard (Admin)
// Purpose: Display comprehensive call statistics with charts

import React, { useState } from 'react';
import { 
  TrendingUp, Phone, CheckCircle, XCircle, Clock, 
  Calendar, BarChart3, Activity 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface CallStatisticsCardProps {
  agentId: string;
}

interface CallStats {
  period: 'day' | 'week' | 'month';
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  total_duration_seconds: number;
  average_duration_seconds: number;
  calls_by_status: { [key: string]: number };
  calls_by_day: Array<{ date: string; count: number }>;
}

export default function CallStatisticsCard({ agentId }: CallStatisticsCardProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const { data: stats, isLoading } = useQuery<CallStats>({
    queryKey: ['call-stats', agentId, period],
    queryFn: async () => {
      const { getCallStatistics } = await import('@/lib/api');
      return getCallStatistics(agentId, period);
    }
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-8 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded"></div>
          ))}
        </div>
        <div className="h-48 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (!stats) return null;

  const successRate = stats.total_calls > 0 
    ? Math.round((stats.completed_calls / stats.total_calls) * 100) 
    : 0;

  const maxCalls = Math.max(...stats.calls_by_day.map(d => d.count), 1);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Call Statistics</h3>
              <p className="text-gray-400 text-sm">Performance overview</p>
            </div>
          </div>
          <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
            {(['day', 'week', 'month'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  period === p
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <Phone className="text-blue-400" size={20} />
              <TrendingUp className="text-green-400" size={16} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.total_calls}</p>
            <p className="text-sm text-gray-400">Total Calls</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-400" size={20} />
              <span className="text-xs text-green-400 font-medium">{successRate}%</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.completed_calls}</p>
            <p className="text-sm text-gray-400">Completed</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="text-red-400" size={20} />
              <span className="text-xs text-red-400 font-medium">
                {Math.round((stats.failed_calls / stats.total_calls) * 100)}%
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.failed_calls}</p>
            <p className="text-sm text-gray-400">Failed</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-purple-400" size={20} />
              <Activity className="text-purple-400" size={16} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatDuration(stats.average_duration_seconds)}</p>
            <p className="text-sm text-gray-400">Avg Duration</p>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="text-blue-400" size={20} />
            Calls Over Time
          </h4>
          <div className="h-48 flex items-end gap-2">
            {stats.calls_by_day.map((day, i) => {
              const height = (day.count / maxCalls) * 100;
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                  <div className="relative w-full">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      <p className="text-white font-semibold">{day.count} calls</p>
                      <p className="text-gray-400 text-xs">{date.toLocaleDateString()}</p>
                    </div>
                    <div 
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-purple-600 transition-all duration-500 hover:from-blue-500 hover:to-purple-500 cursor-pointer"
                      style={{ 
                        height: `${height}%`,
                        minHeight: '8px'
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Status Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(stats.calls_by_status).map(([status, count]) => {
              const percentage = (count / stats.total_calls) * 100;
              
              const statusConfig: { [key: string]: { color: string; label: string } } = {
                completed: { color: 'from-green-500 to-emerald-500', label: 'Completed' },
                failed: { color: 'from-red-500 to-rose-500', label: 'Failed' },
                busy: { color: 'from-yellow-500 to-orange-500', label: 'Busy' },
                'no-answer': { color: 'from-blue-500 to-cyan-500', label: 'No Answer' }
              };
              const config = statusConfig[status] || { color: 'from-gray-500 to-gray-600', label: status };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium capitalize">{config.label}</span>
                    <span className="text-gray-400 text-sm">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${config.color} transition-all duration-1000 ease-out rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Clock className="text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Call Time</p>
                <p className="text-white font-semibold text-lg">{formatDuration(stats.total_duration_seconds)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Average</p>
              <p className="text-white font-semibold">{formatDuration(stats.average_duration_seconds)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

