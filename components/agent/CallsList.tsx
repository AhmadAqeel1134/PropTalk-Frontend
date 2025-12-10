// components/agent/CallsList.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCalls } from '@/lib/real_estate_agent/api'
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneOff, PhoneCall, Search, Filter, Play, Clock, User, Calendar, X, FileText } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import CallDetailsSheet from './CallDetailsSheet'
import { useTheme } from '@/contexts/ThemeContext'

interface Call {
  id: string
  voice_agent_name?: string
  contact_name?: string
  contact_phone?: string
  from_number: string
  to_number: string
  twilio_phone_number?: string
  status: string
  direction: string
  duration_seconds: number
  recording_url?: string
  created_at: string
  started_at?: string
  answered_at?: string
  ended_at?: string
   transcript?: string | null
   transcript_json?: any[] | null
   user_pov_summary?: string | null
}

export default function CallsList() {
  const { theme } = useTheme()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [directionFilter, setDirectionFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [transcriptCall, setTranscriptCall] = useState<Call | null>(null)
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [transcriptPage, setTranscriptPage] = useState(1)
  const transcriptPageSize = 30
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setTranscriptPage(1)
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = 0
    }
  }, [transcriptCall])

  const { data, isLoading, error } = useQuery({
    queryKey: ['agent', 'calls', page, statusFilter, directionFilter, searchQuery],
    queryFn: () => getCalls({
      page,
      page_size: 20,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      direction: directionFilter !== 'all' ? directionFilter : undefined,
      search: searchQuery || undefined,
    }),
  })

  const hasActiveFilters = statusFilter !== 'all' || directionFilter !== 'all' || searchQuery !== ''

  const handleClearFilters = () => {
    setStatusFilter('all')
    setDirectionFilter('all')
    setSearchQuery('')
    setPage(1)
  }

  const calls: Call[] = data?.items || []
  const total = data?.total || 0

  const visibleTranscriptMessages =
    transcriptCall?.transcript_json && Array.isArray(transcriptCall.transcript_json)
      ? transcriptCall.transcript_json.slice(0, transcriptPage * transcriptPageSize)
      : []

  const handleOpenTranscript = async (id: string) => {
    try {
      setTranscriptLoading(true)
      const { getCallById } = await import('@/lib/real_estate_agent/api')
      const fullCall = await getCallById(id)
      setTranscriptCall(fullCall as any)
    } catch (error) {
      console.error('Error loading transcript', error)
    } finally {
      setTranscriptLoading(false)
    }
  }

  const handleCallClick = (callId: string) => {
    setSelectedCallId(callId)
    setIsDetailsSheetOpen(true)
  }

  const getStatusIcon = (status: string, direction: string) => {
    if (status === 'completed') {
      return direction === 'inbound' ? PhoneIncoming : PhoneOutgoing
    }
    if (status === 'failed' || status === 'busy' || status === 'no-answer') {
      return PhoneOff
    }
    return PhoneCall
  }

  const getStatusColor = (status: string) => {
    if (theme === 'light') {
      switch (status) {
        case 'completed':
          return 'text-green-700 bg-green-100 border-green-300'
        case 'failed':
        case 'busy':
        case 'no-answer':
          return 'text-red-700 bg-red-100 border-red-300'
        case 'initiated':
        case 'ringing':
        case 'in-progress':
          return 'text-blue-700 bg-blue-100 border-blue-300'
        default:
          return 'text-gray-700 bg-gray-100 border-gray-300'
      }
    } else {
      switch (status) {
        case 'completed':
          return 'text-green-400 bg-green-500/10 border-green-500/20'
        case 'failed':
        case 'busy':
        case 'no-answer':
          return 'text-red-400 bg-red-500/10 border-red-500/20'
        case 'initiated':
        case 'ringing':
        case 'in-progress':
          return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
        default:
          return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
      }
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }

  if (error) return <ErrorMessage message={(error as Error).message} />

  return (
    <PageTransition>
      <div
        className="min-h-screen p-6 md:p-8"
        style={
          theme === 'dark'
            ? { background: 'rgba(10, 15, 25, 0.95)' }
            : { background: 'rgba(248, 250, 252, 0.98)' }
        }
      >
        <div className="max-w-full">
          {/* Enhanced Header */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div
              className={`rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50'
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-xl border ${
                        theme === 'dark'
                          ? 'bg-gray-800/60 border-gray-700/50'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <Phone size={24} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
                    </div>
                    <div>
                      <h1 className={`text-3xl md:text-4xl font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Call History
                      </h1>
                      <p className={`text-sm md:text-base ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {total} call{total !== 1 ? 's' : ''} recorded • Review and listen to recordings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div
            className={`mb-8 rounded-2xl p-6 backdrop-blur-sm shadow-xl transition-all duration-500 ease-out ${
              theme === 'dark'
                ? 'bg-gray-900/60 border border-gray-800/50'
                : 'bg-white border border-gray-200 shadow-sm'
            } ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="flex flex-col gap-4">
              {/* Search and Clear Filters */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search by contact name or phone number..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setPage(1)
                    }}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700/50 text-white focus:ring-gray-600 focus:border-transparent'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-400 focus:border-blue-400 shadow-sm'
                    }`}
                  />
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className={`px-4 py-3 border rounded-xl font-medium transition-all flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-blue-400 shadow-sm'
                    }`}
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Status Filter */}
                <div className="flex-1">
                  <label className={`block text-xs mb-2 font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Status
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'initiated', label: 'Initiated' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'no-answer', label: 'No Answer' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setStatusFilter(value)
                          setPage(1)
                        }}
                        className={`px-4 py-2 rounded-xl font-medium transition-all border ${
                          statusFilter === value
                            ? theme === 'dark'
                              ? 'bg-gray-800 border-2 border-gray-600 text-white'
                              : 'bg-blue-50 border-2 border-blue-200 text-blue-700 shadow-sm'
                            : theme === 'dark'
                            ? 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'
                            : 'bg-white border border-gray-300 text-gray-600 hover:text-blue-700 hover:border-blue-400 shadow-sm'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direction Filter */}
                <div className="flex-1">
                  <label className={`block text-xs mb-2 font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Direction
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'inbound', label: 'Inbound' },
                      { value: 'outbound', label: 'Outbound' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setDirectionFilter(value)
                          setPage(1)
                        }}
                        className={`px-4 py-2 rounded-xl font-medium transition-all border ${
                          directionFilter === value
                            ? theme === 'dark'
                              ? 'bg-gray-800 border-2 border-gray-600 text-white'
                              : 'bg-blue-50 border-2 border-blue-200 text-blue-700 shadow-sm'
                            : theme === 'dark'
                            ? 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'
                            : 'bg-white border border-gray-300 text-gray-600 hover:text-blue-700 hover:border-blue-400 shadow-sm'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline View */}
          {isLoading ? (
            <LoadingSpinner />
          ) : calls.length === 0 ? (
            <div
              className={`text-center py-20 border-2 rounded-2xl backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-gray-800/50'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <Phone className={`size-20 mx-auto mb-6 ${
                theme === 'dark' ? 'text-gray-700' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No calls found
              </h3>
              <p className={`mb-8 max-w-md mx-auto ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'Your call history will appear here once you start making calls'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {calls.map((call, index) => {
                const StatusIcon = getStatusIcon(call.status, call.direction)
                const isOutbound = call.direction === 'outbound'
                const callerName = isOutbound 
                  ? (call.voice_agent_name || 'Voice Agent')
                  : (call.contact_name || 'Unknown Caller')
                const callerPhone = isOutbound 
                  ? (call.twilio_phone_number || call.from_number)
                  : (call.contact_phone || call.from_number)
                const receiverName = isOutbound
                  ? (call.contact_name || call.to_number)
                  : (call.voice_agent_name || 'Voice Agent')
                const receiverPhone = isOutbound
                  ? (call.contact_phone || call.to_number)
                  : (call.twilio_phone_number || call.to_number)

                return (
                  <div
                    key={call.id}
                    onClick={() => handleCallClick(call.id)}
                    className={`group relative border-2 rounded-2xl p-6 backdrop-blur-sm shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-gray-800/50 hover:border-gray-700'
                        : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
                    } ${
                      isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${Math.min(index * 50, 500)}ms` }}
                  >
                    {/* Timeline Line */}
                    <div
                      className={`absolute left-8 top-0 bottom-0 w-0.5 transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-800 group-hover:bg-gray-700'
                          : 'bg-gray-200 group-hover:bg-gray-300'
                      }`}
                    />
                    
                    {/* Content */}
                    <div className="relative flex items-start gap-6">
                      {/* Icon */}
                      <div
                        className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                          call.status === 'completed'
                            ? theme === 'dark'
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-green-100 border-green-300'
                            : call.status === 'failed' || call.status === 'busy' || call.status === 'no-answer'
                            ? theme === 'dark'
                              ? 'bg-red-500/10 border-red-500/30'
                              : 'bg-red-100 border-red-300'
                            : theme === 'dark'
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-blue-100 border-blue-300'
                        }`}
                      >
                        <StatusIcon
                          className={`size-7 ${
                            call.status === 'completed'
                              ? theme === 'dark'
                                ? 'text-green-400'
                                : 'text-green-600'
                              : call.status === 'failed' || call.status === 'busy' || call.status === 'no-answer'
                              ? theme === 'dark'
                                ? 'text-red-400'
                                : 'text-red-600'
                              : theme === 'dark'
                              ? 'text-blue-400'
                              : 'text-blue-600'
                          }`}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`text-lg font-bold truncate ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {isOutbound ? (
                                  <>
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                      {callerName}
                                    </span>
                                    <span className="mx-2">→</span>
                                    <span>{receiverName}</span>
                                  </>
                                ) : (
                                  <>
                                    <span>{callerName}</span>
                                    <span className="mx-2">→</span>
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                      {receiverName}
                                    </span>
                                  </>
                                )}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(call.status)}`}>
                                {call.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div className={`flex items-center gap-4 text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <div className="flex items-center gap-1.5">
                                <User size={14} />
                                <span>{callerPhone}</span>
                              </div>
                              {call.duration_seconds > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <Clock size={14} />
                                  <span>{formatDuration(call.duration_seconds)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                <span>{formatDate(call.created_at)}</span>
                              </div>
                            </div>
                          </div>
                              <div className="flex-shrink-0 flex items-center gap-2">
                                {call.status !== 'no-answer' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleOpenTranscript(call.id)
                                    }}
                                    className={`p-2 rounded-lg border transition-colors ${
                                      theme === 'dark'
                                        ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200'
                                        : 'bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800'
                                    }`}
                                    title="View transcript"
                                  >
                                    <FileText className="size-5" />
                                  </button>
                                )}
                                {call.recording_url && (
                                  <div
                                    className={`p-2 rounded-lg border transition-colors ${
                                      theme === 'dark'
                                        ? 'bg-gray-800/50 border-gray-700/50 group-hover:border-gray-600'
                                        : 'bg-gray-50 border-gray-200 group-hover:border-blue-300'
                                    }`}
                                  >
                                    <Play
                                      className={`size-5 transition-colors ${
                                        theme === 'dark'
                                          ? 'text-gray-400 group-hover:text-white'
                                          : 'text-gray-500 group-hover:text-blue-600'
                                      }`}
                                    />
                                  </div>
                                )}
                              </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="mt-8 flex items-center justify-between">
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} calls
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:text-white hover:border-gray-600'
                      : 'bg-white border-gray-200 text-gray-700 hover:text-blue-700 hover:border-blue-400 shadow-sm'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 20 >= total}
                  className={`px-4 py-2 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:text-white hover:border-gray-600'
                      : 'bg-white border-gray-200 text-gray-700 hover:text-blue-700 hover:border-blue-400 shadow-sm'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Transcript Side Sheet */}
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
                        {new Date(transcriptCall.started_at || transcriptCall.created_at || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
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
                  {transcriptLoading && (
                    <p className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                      Loading transcript...
                    </p>
                  )}
                  {!transcriptLoading && Array.isArray(transcriptCall.transcript_json) && transcriptCall.transcript_json.length > 0 ? (
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
                                {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : !transcriptLoading && transcriptCall.transcript ? (
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
                          {new Date(transcriptCall.started_at || transcriptCall.created_at || '').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  ) : (
                    !transcriptLoading && (
                      <p className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                        No transcript available for this call.
                      </p>
                    )
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>

      {/* Call Details Side Sheet */}
      {selectedCallId && (
        <CallDetailsSheet
          callId={selectedCallId}
          isOpen={isDetailsSheetOpen}
          onClose={() => {
            setIsDetailsSheetOpen(false)
            setSelectedCallId(null)
          }}
        />
      )}
    </PageTransition>
  )
}

