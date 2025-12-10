'use client'

// Component: CallCard
// Purpose: Individual call card component

import React from 'react';
import { PhoneIncoming, PhoneOutgoing, Clock, Play, Eye, CheckCircle, XCircle, PhoneOff, FileText } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Call {
  id: string;
  contact_name: string | null;
  from_number: string;
  to_number: string;
  status: 'completed' | 'failed' | 'busy' | 'no-answer' | 'in-progress';
  direction: 'inbound' | 'outbound';
  duration_seconds: number;
  recording_url: string | null;
  started_at: string | null;
  created_at: string;
  transcript?: string | null;
  transcript_json?: any[] | null;
  user_pov_summary?: string | null;
}

interface CallCardProps {
  call: Call;
  onViewDetails: (id: string) => void;
  onListen?: (id: string) => void;
  onViewTranscript?: (id: string) => void;
  hideTranscriptIconButton?: boolean;
  hideTranscriptIconWhenNoAnswer?: boolean;
  disableActionsOnNoAnswer?: boolean;
  forceActionsVisibleOnNoAnswer?: boolean;
  enforceUniformHeight?: boolean;
}

export default function CallCard({
  call,
  onViewDetails,
  onListen,
  onViewTranscript,
  hideTranscriptIconButton = false,
  hideTranscriptIconWhenNoAnswer = false,
  disableActionsOnNoAnswer = false,
  forceActionsVisibleOnNoAnswer = false,
  enforceUniformHeight = false
}: CallCardProps) {
  const { theme } = useTheme();
  const isNoAnswerDisabled = disableActionsOnNoAnswer && call.status === 'no-answer';
  const transcriptAvailable = !!(call.transcript_json?.length || call.transcript);
  const listenAvailable = !!call.recording_url;
  const showTranscriptAction = transcriptAvailable || (isNoAnswerDisabled && forceActionsVisibleOnNoAnswer);
  const showListenAction = listenAvailable || (isNoAnswerDisabled && forceActionsVisibleOnNoAnswer);
  
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: theme === 'dark' ? 'text-green-400' : 'text-green-700',
      bg: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-100',
      border: theme === 'dark' ? 'border-green-500/20' : 'border-green-300',
      label: 'Completed'
    },
    failed: {
      icon: XCircle,
      color: theme === 'dark' ? 'text-red-400' : 'text-red-700',
      bg: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-100',
      border: theme === 'dark' ? 'border-red-500/20' : 'border-red-300',
      label: 'Failed'
    },
    busy: {
      icon: PhoneOff,
      color: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700',
      bg: theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100',
      border: theme === 'dark' ? 'border-yellow-500/20' : 'border-yellow-300',
      label: 'Busy'
    },
    'no-answer': {
      icon: PhoneOff,
      color: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
      bg: theme === 'dark' ? 'bg-gray-500/10' : 'bg-gray-100',
      border: theme === 'dark' ? 'border-gray-500/20' : 'border-gray-300',
      label: 'No Answer'
    },
    'in-progress': {
      icon: Clock,
      color: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
      bg: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100',
      border: theme === 'dark' ? 'border-blue-500/20' : 'border-blue-300',
      label: 'In Progress'
    }
  };

  const config = statusConfig[call.status] || statusConfig.completed;
  const StatusIcon = config.icon;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-800 hover:border-gray-700 hover:shadow-black/20'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100/50 shadow-sm'
      } ${enforceUniformHeight ? 'h-full min-h-[340px]' : ''}`}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${config.bg} ${config.border}`}>
              {call.direction === 'inbound' ? (
                <PhoneIncoming
                  className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}
                  size={20}
                />
              ) : (
                <PhoneOutgoing
                  className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
                  size={20}
                />
              )}
            </div>
            <div>
              <h3 className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {call.contact_name || call.from_number}
              </h3>
              <p className={`text-xs font-mono ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {call.from_number}
              </p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-md text-xs font-medium border ${config.color} ${config.bg} ${config.border}`}>
            <div className="flex items-center gap-1">
              <StatusIcon size={12} />
              {config.label}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
              Duration
            </span>
            <span className={`font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {formatDuration(call.duration_seconds)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
              Date
            </span>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {formatDate(call.started_at || call.created_at)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
              Direction
            </span>
            <span className={`font-medium ${
              call.direction === 'inbound'
                ? theme === 'dark'
                  ? 'text-green-400'
                  : 'text-green-700'
                : theme === 'dark'
                ? 'text-blue-400'
                : 'text-blue-700'
            }`}>
              {call.direction === 'inbound' ? 'Inbound' : 'Outbound'}
            </span>
          </div>
        </div>

          <div
            className={`mb-4 rounded-lg border p-3 text-sm ${
              theme === 'dark'
                ? 'bg-purple-500/5 border-purple-500/20 text-gray-200'
                : 'bg-purple-50 border-purple-200 text-gray-800'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">User POV</p>
          <p className={`mt-1 leading-relaxed ${
            call.user_pov_summary
              ? ''
              : theme === 'dark'
                ? 'text-gray-400'
                : 'text-gray-500'
          }`}>
            {call.user_pov_summary || 'User POV not available'}
          </p>
          </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          {!hideTranscriptIconButton && !(hideTranscriptIconWhenNoAnswer && call.status === 'no-answer') && (
          <button
              onClick={() => {
                if (isNoAnswerDisabled) return;
                onViewTranscript?.(call.id);
              }}
              disabled={isNoAnswerDisabled}
            className={`px-3 py-2 rounded-lg border font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200'
                : 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 hover:text-blue-800 shadow-sm'
            }`}
              aria-disabled={isNoAnswerDisabled}
            title="View transcript"
          >
            <FileText size={16} />
          </button>
          )}
          {showListenAction && (
            <button
              onClick={() => {
                if (isNoAnswerDisabled || !listenAvailable) return;
                onListen?.(call.id);
              }}
              disabled={isNoAnswerDisabled || !listenAvailable}
              className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'bg-purple-600/10 border-purple-600/30 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300'
                  : 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700 hover:text-purple-800 shadow-sm'
              }`}
              aria-disabled={isNoAnswerDisabled || !listenAvailable}
            >
              <Play size={16} />
              Listen
            </button>
          )}
          {showTranscriptAction && (
            <button
              onClick={() => {
                if (isNoAnswerDisabled || !transcriptAvailable) return;
                onViewTranscript?.(call);
              }}
              disabled={isNoAnswerDisabled || !transcriptAvailable}
              className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200'
                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 hover:text-blue-800 shadow-sm'
              }`}
              aria-disabled={isNoAnswerDisabled || !transcriptAvailable}
            >
              <FileText size={16} />
              Transcript
            </button>
          )}
          <button
            onClick={() => {
              if (isNoAnswerDisabled) return;
              onViewDetails(call.id);
            }}
            disabled={isNoAnswerDisabled}
            className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-700 shadow-sm'
            }`}
            aria-disabled={isNoAnswerDisabled}
          >
            <Eye size={16} />
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

