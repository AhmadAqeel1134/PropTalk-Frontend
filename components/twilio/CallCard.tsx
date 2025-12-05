'use client'

// Component: CallCard
// Purpose: Individual call card component

import React from 'react';
import { PhoneIncoming, PhoneOutgoing, Clock, Play, Eye, CheckCircle, XCircle, PhoneOff } from 'lucide-react';

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
}

interface CallCardProps {
  call: Call;
  onViewDetails: (id: string) => void;
  onListen?: (recordingUrl: string) => void;
}

export default function CallCard({ call, onViewDetails, onListen }: CallCardProps) {
  const statusConfig = {
    completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Completed' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Failed' },
    busy: { icon: PhoneOff, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Busy' },
    'no-answer': { icon: PhoneOff, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'No Answer' },
    'in-progress': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'In Progress' }
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
    <div className="group relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
              {call.direction === 'inbound' ? (
                <PhoneIncoming className="text-green-400" size={20} />
              ) : (
                <PhoneOutgoing className="text-blue-400" size={20} />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {call.contact_name || call.from_number}
              </h3>
              <p className="text-gray-400 text-xs font-mono">{call.from_number}</p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${config.color} ${config.bg} border ${config.border}`}>
            <div className="flex items-center gap-1">
              <StatusIcon size={12} />
              {config.label}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Duration</span>
            <span className="text-white font-medium">{formatDuration(call.duration_seconds)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="text-gray-400">{formatDate(call.started_at || call.created_at)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Direction</span>
            <span className={`font-medium ${call.direction === 'inbound' ? 'text-green-400' : 'text-blue-400'}`}>
              {call.direction === 'inbound' ? 'Inbound' : 'Outbound'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {call.recording_url && (
            <button
              onClick={() => onListen?.(call.recording_url!)}
              className="flex-1 px-4 py-2 rounded-lg bg-purple-600/10 border border-purple-600/30 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300 font-medium transition-all text-sm flex items-center justify-center gap-2"
            >
              <Play size={16} />
              Listen
            </button>
          )}
          <button
            onClick={() => onViewDetails(call.id)}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium transition-all text-sm flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

