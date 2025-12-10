'use client'

// Component: CallHistoryList
// Purpose: Advanced call history with real-time filters, search, and smooth animations

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, PhoneIncoming, PhoneOutgoing, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import CallCard from '@/components/twilio/CallCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
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

interface CallHistoryListProps {
  onViewDetails?: (id: string) => void;
  onListen?: (id: string) => void;
  hideTranscriptIconButton?: boolean;
  hideTranscriptIconWhenNoAnswer?: boolean;
  disableActionsOnNoAnswer?: boolean;
  forceActionsVisibleOnNoAnswer?: boolean;
  enforceUniformHeight?: boolean;
}

export default function CallHistoryList({
  onViewDetails,
  onListen,
  hideTranscriptIconButton = false,
  hideTranscriptIconWhenNoAnswer = false,
  disableActionsOnNoAnswer = false,
  forceActionsVisibleOnNoAnswer = false,
  enforceUniformHeight = false
}: CallHistoryListProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [transcriptCall, setTranscriptCall] = useState<Call | null>(null);
  const [transcriptPage, setTranscriptPage] = useState(1);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const transcriptPageSize = 30;
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);
  const pageSize = 12;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Date unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['calls', currentPage, statusFilter, directionFilter, searchTerm],
    queryFn: async () => {
      const { getCalls } = await import('@/lib/real_estate_agent/api');
      return getCalls({
        page: currentPage,
        page_size: pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        direction: directionFilter !== 'all' ? directionFilter : undefined,
        search: searchTerm || undefined
      });
    }
  });

  const filteredCalls = useMemo(() => {
    if (!data?.items) return [];
    
    return data.items.filter((call: Call) => {
      const matchesSearch = !searchTerm || 
        call.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.from_number.includes(searchTerm) ||
        call.to_number.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
      const matchesDirection = directionFilter === 'all' || call.direction === directionFilter;
      
      return matchesSearch && matchesStatus && matchesDirection;
    });
  }, [data?.items, searchTerm, statusFilter, directionFilter]);

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  useEffect(() => {
    setTranscriptPage(1);
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = 0;
    }
  }, [transcriptCall]);

  const visibleTranscriptMessages =
    transcriptCall?.transcript_json && Array.isArray(transcriptCall.transcript_json)
      ? transcriptCall.transcript_json.slice(0, transcriptPage * transcriptPageSize)
      : [];

  const handleOpenTranscript = async (id: string) => {
    try {
      setTranscriptLoading(true);
      const { getCallById } = await import('@/lib/real_estate_agent/api');
      const fullCall = await getCallById(id);
      setTranscriptCall(fullCall as any);
    } catch (err) {
      console.error('Failed to load transcript', err);
    } finally {
      setTranscriptLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 group-focus-within:text-blue-400'
                : 'text-gray-500 group-focus-within:text-blue-600'
            }`}
            size={20}
          />
          <input
            type="text"
            placeholder="Search by contact name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-800 text-white focus:border-blue-500/50 focus:ring-blue-500/20'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm'
            }`}
          />
          {searchTerm && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div
                className={`px-2 py-1 rounded-md border ${
                  theme === 'dark'
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  {filteredCalls.length} results
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative group">
            <Filter
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
                theme === 'dark'
                  ? 'text-gray-400 group-focus-within:text-purple-400'
                  : 'text-gray-500 group-focus-within:text-purple-600'
              }`}
              size={16}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`pl-10 pr-8 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800 text-white focus:border-purple-500/50 focus:ring-purple-500/20 hover:border-gray-700'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20 hover:border-gray-400 shadow-sm'
              }`}
            >
              <option value="all">All Status</option>
              <option value="initiated">Initiated</option>
              <option value="completed">Completed</option>
              <option value="no-answer">No Answer</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className={`pl-10 pr-8 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800 text-white focus:border-purple-500/50 focus:ring-purple-500/20 hover:border-gray-700'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20 hover:border-gray-400 shadow-sm'
              }`}
            >
              <option value="all">All Calls</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
            {directionFilter === 'inbound' && (
              <PhoneIncoming
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}
                size={16}
              />
            )}
            {directionFilter === 'outbound' && (
              <PhoneOutgoing
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
                size={16}
              />
            )}
            {directionFilter === 'all' && (
              <Filter
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
                size={16}
              />
            )}
          </div>
        </div>
      </div>

      {filteredCalls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCalls.map((call: Call, index: number) => (
            <div
              key={call.id}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              <CallCard
                call={call}
                onViewDetails={(id) => onViewDetails?.(id)}
                onListen={(id) => onListen?.(id)}
                onViewTranscript={(id) => handleOpenTranscript(id)}
                hideTranscriptIconButton={hideTranscriptIconButton}
                hideTranscriptIconWhenNoAnswer={hideTranscriptIconWhenNoAnswer}
                disableActionsOnNoAnswer={disableActionsOnNoAnswer}
                forceActionsVisibleOnNoAnswer={forceActionsVisibleOnNoAnswer}
                enforceUniformHeight={enforceUniformHeight}
              />
            </div>
          ))}
        </div>
      )}

      {filteredCalls.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full border mb-4 ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Search
              className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
              size={32}
            />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            No calls found
          </h3>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {searchTerm ? 'Try adjusting your search or filters' : 'No call history available yet'}
          </p>
          {(searchTerm || statusFilter !== 'all' || directionFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDirectionFilter('all');
              }}
              className={`px-6 py-3 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                  : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-700 shadow-sm'
              }`}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div
          className={`flex items-center justify-between pt-6 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}
        >
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data?.total || 0)} of {data?.total || 0} calls
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                  : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : theme === 'dark'
                        ? 'bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-700 shadow-sm'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                  : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {transcriptCall && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setTranscriptCall(null)}
          />
          <aside
            className={`absolute right-0 top-0 h-full w-full md:w-[720px] lg:w-[860px] border-l shadow-2xl overflow-hidden ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
              }`}
            >
              <div>
                <p className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                  Transcript
                </p>
                <h3 className={theme === 'dark' ? 'text-lg text-white font-semibold' : 'text-lg text-gray-900 font-semibold'}>
                  {transcriptCall.contact_name || 'Unknown Contact'}
                </h3>
                {(transcriptCall.started_at || transcriptCall.created_at) && (
                  <p className={theme === 'dark' ? 'text-xs text-gray-500' : 'text-xs text-gray-500'}>
                    {formatDate(transcriptCall.started_at || transcriptCall.created_at)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setTranscriptCall(null)}
                className={`p-2 rounded-full ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>

            <div
              ref={transcriptScrollRef}
              className="p-6 space-y-3 h-[calc(100%-64px)] overflow-y-auto"
              onScroll={(e) => {
                if (
                  transcriptCall?.transcript_json &&
                  transcriptCall.transcript_json.length > visibleTranscriptMessages.length
                ) {
                  const target = e.currentTarget;
                  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 40) {
                    setTranscriptPage((p) => p + 1);
                  }
                }
              }}
            >
              {Array.isArray(transcriptCall.transcript_json) && transcriptCall.transcript_json.length > 0 ? (
                visibleTranscriptMessages.map((msg: any, idx: number) => {
                  const isAgent = msg.role === 'assistant';
                  return (
                    <div
                      key={`${msg.timestamp || idx}-${idx}`}
                      className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 border text-sm leading-relaxed ${
                          isAgent
                            ? theme === 'dark'
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-100'
                              : 'bg-blue-50 border-blue-200 text-blue-900'
                            : theme === 'dark'
                            ? 'bg-green-500/10 border-green-500/30 text-green-100'
                            : 'bg-green-50 border-green-200 text-green-900'
                        }`}
                      >
                        <p className="font-semibold text-xs mb-1 uppercase tracking-wide opacity-80">
                          {isAgent ? 'Twilio Agent' : 'User'}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.content || ''}</p>
                        {msg.timestamp && (
                          <p className="text-[11px] mt-2 opacity-70 text-right">
                            {formatTime(msg.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : transcriptCall.transcript ? (
                <div
                  className={`rounded-2xl px-4 py-3 border text-sm leading-relaxed ${
                    theme === 'dark'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-100'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <p className="font-semibold text-xs mb-1 uppercase tracking-wide opacity-80">
                    Twilio Agent
                  </p>
                  <p className="whitespace-pre-wrap">{transcriptCall.transcript}</p>
                  {(transcriptCall.started_at || transcriptCall.created_at) && (
                    <p className="text-[11px] mt-2 opacity-70 text-right">
                      {formatTime(transcriptCall.started_at || transcriptCall.created_at)}
                    </p>
                  )}
                </div>
              ) : (
                <p className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                  No transcript available for this call.
                </p>
              )}
            </div>
          </aside>
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

