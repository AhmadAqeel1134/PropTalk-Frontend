// components/agent/CallsList.tsx
'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCalls } from '@/lib/real_estate_agent/api'
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneOff, PhoneCall, Search, Filter, Play, Clock, User, Calendar, X } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import CallDetailsSheet from './CallDetailsSheet'

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
}

export default function CallsList() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [directionFilter, setDirectionFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-full">
          {/* Enhanced Header */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gray-800/60 border border-gray-700/50">
                      <Phone size={24} className="text-gray-300" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                        Call History
                      </h1>
                      <p className="text-gray-400 text-sm md:text-base">
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
            className={`mb-8 bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="flex flex-col gap-4">
              {/* Search and Clear Filters */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by contact name or phone number..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setPage(1)
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
                  />
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600 rounded-xl font-medium transition-all flex items-center gap-2"
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
                  <label className="block text-xs text-gray-400 mb-2 font-medium">Status</label>
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
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          statusFilter === value
                            ? 'bg-gray-800 border-2 border-gray-600 text-white'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direction Filter */}
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-2 font-medium">Direction</label>
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
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          directionFilter === value
                            ? 'bg-gray-800 border-2 border-gray-600 text-white'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'
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
            <div className="text-center py-20 bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-2 border-gray-800/50 rounded-2xl backdrop-blur-sm">
              <Phone className="size-20 text-gray-700 mx-auto mb-6" />
              <h3 className="text-xl text-gray-400 font-medium mb-2">No calls found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
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
                    className={`group relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-2 border-gray-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl cursor-pointer transition-all duration-300 hover:border-gray-700 hover:shadow-2xl hover:-translate-y-1 ${
                      isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${Math.min(index * 50, 500)}ms` }}
                  >
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-800 group-hover:bg-gray-700 transition-colors" />
                    
                    {/* Content */}
                    <div className="relative flex items-start gap-6">
                      {/* Icon */}
                      <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                        call.status === 'completed' 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : call.status === 'failed' || call.status === 'busy' || call.status === 'no-answer'
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-blue-500/10 border-blue-500/30'
                      }`}>
                        <StatusIcon className={`size-7 ${
                          call.status === 'completed' 
                            ? 'text-green-400' 
                            : call.status === 'failed' || call.status === 'busy' || call.status === 'no-answer'
                            ? 'text-red-400'
                            : 'text-blue-400'
                        }`} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-white truncate">
                                {isOutbound ? (
                                  <>
                                    <span className="text-gray-400">{callerName}</span>
                                    <span className="mx-2">→</span>
                                    <span>{receiverName}</span>
                                  </>
                                ) : (
                                  <>
                                    <span>{callerName}</span>
                                    <span className="mx-2">→</span>
                                    <span className="text-gray-400">{receiverName}</span>
                                  </>
                                )}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(call.status)}`}>
                                {call.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
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
                          {call.recording_url && (
                            <div className="flex-shrink-0">
                              <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 group-hover:border-gray-600 transition-colors">
                                <Play className="size-5 text-gray-400 group-hover:text-white transition-colors" />
                              </div>
                            </div>
                          )}
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
              <div className="text-sm text-gray-400">
                Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} calls
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-xl text-gray-300 hover:text-white hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 20 >= total}
                  className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-xl text-gray-300 hover:text-white hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
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

