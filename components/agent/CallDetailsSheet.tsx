// components/agent/CallDetailsSheet.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCallById, getCallRecording } from '@/lib/real_estate_agent/api'
import CallRecordingModal from './CallRecordingModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
import { X, Phone, PhoneIncoming, PhoneOutgoing, Clock, Calendar, User, Play, FileText } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

interface CallDetailsSheetProps {
  callId: string
  isOpen: boolean
  onClose: () => void
}

export default function CallDetailsSheet({ callId, isOpen, onClose }: CallDetailsSheetProps) {
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false)

  const { data: call, isLoading, error } = useQuery({
    queryKey: ['agent', 'call', callId],
    queryFn: () => getCallById(callId),
    enabled: isOpen && !!callId,
  })

  const { data: recording } = useQuery({
    queryKey: ['agent', 'call', callId, 'recording'],
    queryFn: () => getCallRecording(callId),
    enabled: isOpen && !!callId && !!call?.recording_url,
  })

  // Get proxied recording URL from API response or construct it
  const getRecordingUrl = () => {
    if (recording?.recording_url) {
      if (recording.recording_url.startsWith('http')) {
        return recording.recording_url
      }
      return `${API_URL}${recording.recording_url}`
    }
    if (call?.recording_url) {
      return `${API_URL}/agent/calls/${callId}/recording/stream`
    }
    return null
  }

  const recordingUrl = getRecordingUrl()

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  const isOutbound = call?.direction === 'outbound'
  const callerName = isOutbound 
    ? (call?.voice_agent_name || 'Voice Agent')
    : (call?.contact_name || 'Unknown Caller')
  const callerPhone = isOutbound 
    ? (call?.twilio_phone_number || call?.from_number)
    : (call?.contact_phone || call?.from_number)
  const receiverName = isOutbound
    ? (call?.contact_name || call?.to_number)
    : (call?.voice_agent_name || 'Voice Agent')
  const receiverPhone = isOutbound
    ? (call?.contact_phone || call?.to_number)
    : (call?.twilio_phone_number || call?.to_number)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Side Sheet */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-gray-900 border-l border-gray-800 z-50 shadow-2xl overflow-y-auto"
        style={{
          animation: isOpen ? 'slide-in-from-right 0.3s ease-out' : 'none',
        }}
      >
        <div className="sticky top-0 z-10 p-6 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Call Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={(error as Error).message} />
          ) : !call ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Call not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Call Header */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                    call.status === 'completed' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : call.status === 'failed' || call.status === 'busy' || call.status === 'no-answer'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    {isOutbound ? (
                      <PhoneOutgoing className="size-8 text-green-400" />
                    ) : (
                      <PhoneIncoming className="size-8 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {isOutbound ? 'Outbound Call' : 'Inbound Call'}
                    </h3>
                    <p className={`text-sm font-semibold px-3 py-1 rounded-full inline-block border ${
                      call.status === 'completed' 
                        ? 'text-green-400 bg-green-500/10 border-green-500/20' 
                        : call.status === 'failed' || call.status === 'busy' || call.status === 'no-answer'
                        ? 'text-red-400 bg-red-500/10 border-red-500/20'
                        : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    }`}>
                      {call.status.replace('-', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Call Flow */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <User className="size-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">From</p>
                      <p className="text-white font-semibold">{callerName}</p>
                      <p className="text-sm text-gray-400">{callerPhone}</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-0.5 h-8 bg-gray-700" />
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <Phone className="size-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">To</p>
                      <p className="text-white font-semibold">{receiverName}</p>
                      <p className="text-sm text-gray-400">{receiverPhone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Player */}
              {recordingUrl && (
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="size-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-white">Recording</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => setIsRecordingModalOpen(true)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-800 border-2 border-gray-700 hover:border-gray-600 text-white rounded-xl transition-all hover:scale-[1.02] font-semibold"
                    >
                      <Play className="size-5" />
                      <span>Play Recording with Transcription</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Call Information */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Call Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Clock className="size-4" />
                      Duration
                    </span>
                    <span className="text-white font-medium">{formatDuration(call.duration_seconds)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Calendar className="size-4" />
                      Started
                    </span>
                    <span className="text-white font-medium">{formatDateTime(call.started_at)}</span>
                  </div>
                  {call.answered_at && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Phone className="size-4" />
                        Answered
                      </span>
                      <span className="text-white font-medium">{formatDateTime(call.answered_at)}</span>
                    </div>
                  )}
                  {call.ended_at && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-400 flex items-center gap-2">
                        <X className="size-4" />
                        Ended
                      </span>
                      <span className="text-white font-medium">{formatDateTime(call.ended_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript */}
              {call.transcript && (
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Transcript</h3>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{call.transcript}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recording Modal */}
      {isRecordingModalOpen && (
        <CallRecordingModal
          callId={callId}
          isOpen={isRecordingModalOpen}
          onClose={() => setIsRecordingModalOpen(false)}
        />
      )}
    </>
  )
}

