'use client'

// Component: VoiceAgentRequestCard
// Purpose: Display voice agent request status with modern glassmorphic design

import React from 'react';
import { Clock, CheckCircle, XCircle, Sparkles, Phone, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useTheme } from '@/contexts/ThemeContext';

interface VoiceAgentRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export default function VoiceAgentRequestCard() {
  const { theme } = useTheme();
  const { data: request, isLoading } = useQuery<VoiceAgentRequest>({
    queryKey: ['voice-agent-status'],
    queryFn: async () => {
      const { getVoiceAgentStatus } = await import('@/lib/real_estate_agent/api');
      return getVoiceAgentStatus();
    }
  });

  const statusConfig = {
    pending: {
      icon: Clock,
      gradient: 'from-yellow-500 via-orange-500 to-amber-500',
      bg: theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100',
      border: theme === 'dark' ? 'border-yellow-500/30' : 'border-yellow-300',
      text: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700',
      label: 'Under Review',
      description: 'Your request is being reviewed by our team'
    },
    approved: {
      icon: CheckCircle,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bg: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-100',
      border: theme === 'dark' ? 'border-green-500/30' : 'border-green-300',
      text: theme === 'dark' ? 'text-green-400' : 'text-green-700',
      label: 'Approved',
      description: 'Your voice agent is ready to use'
    },
    rejected: {
      icon: XCircle,
      gradient: 'from-red-500 via-rose-500 to-pink-500',
      bg: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-100',
      border: theme === 'dark' ? 'border-red-500/30' : 'border-red-300',
      text: theme === 'dark' ? 'text-red-400' : 'text-red-700',
      label: 'Rejected',
      description: 'Please review the feedback below'
    }
  };

  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border p-8 animate-pulse ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        }`}
      >
        <div
          className={`h-6 rounded w-1/3 mb-4 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
          }`}
        ></div>
        <div
          className={`h-4 rounded w-2/3 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
          }`}
        ></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 p-8 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-800 hover:border-gray-700'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-300 shadow-sm'
        }`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            theme === 'light' ? 'opacity-20' : ''
          }`}
        ></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Phone className="text-white" size={24} />
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Voice Agent Access
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Get your AI-powered calling assistant
              </p>
            </div>
          </div>
          <p className={`mb-6 leading-relaxed ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Request a voice agent to automate your calls, qualify leads, and engage with contacts 24/7.
          </p>
          <button className="group/btn relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5">
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles size={18} />
              Request Voice Agent
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"
              />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>
    );
  }

  const config = statusConfig[request.status];
  const Icon = config.icon;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-800 hover:border-gray-700'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-300 shadow-sm'
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} transition-opacity duration-500 ${
          theme === 'dark'
            ? 'opacity-5 group-hover:opacity-10'
            : 'opacity-10 group-hover:opacity-20'
        }`}
      ></div>

      {request.status === 'pending' && (
        <div className="absolute inset-0">
          <div
            className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl animate-pulse ${
              theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-400/30'
            }`}
          ></div>
        </div>
      )}

      <div className="relative z-10 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-2xl border backdrop-blur-sm ${
                config.bg
              } ${config.border} ${request.status === 'pending' ? 'animate-pulse' : ''}`}
            >
              <Icon className={config.text} size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {config.label}
                </h3>
                {request.status === 'pending' && (
                  <div className="flex gap-1">
                    <span
                      className={`w-2 h-2 rounded-full animate-ping ${
                        theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500'
                      }`}
                    ></span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500'
                      }`}
                    ></span>
                  </div>
                )}
              </div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {config.description}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
              }`}
            ></div>
            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
              Requested
            </span>
            <span className={`ml-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {new Date(request.requested_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {request.reviewed_at && (
            <div className="flex items-center gap-3 text-sm">
              <div
                className={`w-2 h-2 rounded-full ${
                  request.status === 'approved'
                    ? theme === 'dark'
                      ? 'bg-green-500'
                      : 'bg-green-600'
                    : theme === 'dark'
                    ? 'bg-red-500'
                    : 'bg-red-600'
                }`}
              ></div>
              <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                Reviewed
              </span>
              <span className={`ml-auto ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {new Date(request.reviewed_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>

        {request.status === 'rejected' && request.rejection_reason && (
          <div
            className={`p-4 rounded-xl border mb-6 ${
              theme === 'dark'
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <p className={`text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-700'
            }`}>
              Rejection Reason
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
            }`}>
              {request.rejection_reason}
            </p>
          </div>
        )}

        <button
          className={`w-full px-6 py-3 rounded-xl border font-medium transition-all duration-300 group/btn ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white hover:bg-gray-750'
              : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-700 hover:bg-blue-50 shadow-sm'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            View Details
            <ArrowUpRight
              size={18}
              className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"
            />
          </span>
        </button>
      </div>
    </div>
  );
}

