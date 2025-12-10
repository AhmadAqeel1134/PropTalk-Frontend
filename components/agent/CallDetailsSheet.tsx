// components/agent/CallDetailsSheet.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCallById, getCallRecording } from '@/lib/real_estate_agent/api'
import CallRecordingModal from './CallRecordingModal'
import { useTheme } from '@/contexts/ThemeContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
import { X, Phone, PhoneIncoming, PhoneOutgoing, Clock, Calendar, User, Play, Pause, FileText } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

interface CallDetailsSheetProps {
  callId: string
  isOpen: boolean
  onClose: () => void
}

export default function CallDetailsSheet({ callId, isOpen, onClose }: CallDetailsSheetProps) {
  const { theme } = useTheme()
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [barValues, setBarValues] = useState<number[]>(() => Array(32).fill(0))
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number>()

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

  // Fetch the recording with auth and create a blob URL to avoid direct Twilio auth prompts
  useEffect(() => {
    if (!isOpen || !recordingUrl || !call?.recording_url) return

    const fetchRecording = async () => {
      try {
        const token = localStorage.getItem('agent_token') || localStorage.getItem('access_token')
        if (!token) return

        const response = await fetch(recordingUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setAudioBlobUrl(url)
        }
      } catch (error) {
        console.error('Error fetching recording:', error)
      }
    }

    fetchRecording()

    return () => {
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl)
        setAudioBlobUrl(null)
      }
    }
  }, [isOpen, recordingUrl, call?.recording_url])

  // Wire audio element to analyser for live bars
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioBlobUrl || !isOpen) return

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx()
    }
    const ctx = audioContextRef.current

    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser
    }

    // MediaElementAudioSourceNode can only be created once per media element.
    if (!mediaSourceRef.current) {
      mediaSourceRef.current = ctx.createMediaElementSource(audio)
      mediaSourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(ctx.destination)
    }

    const analyser = analyserRef.current!
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    const barsCount = 32

    const animate = () => {
      analyser.getByteFrequencyData(dataArray)
      const bucketSize = Math.max(1, Math.floor(dataArray.length / barsCount))
      const next: number[] = []
      for (let i = 0; i < barsCount; i++) {
        const start = i * bucketSize
        const end = Math.min(dataArray.length, start + bucketSize)
        let sum = 0
        for (let j = start; j < end; j++) sum += dataArray[j]
        const avg = sum / (end - start || 1)
        const height = Math.max(8, (avg / 255) * 100)
        next.push(height)
      }
      setBarValues(next)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      // Keep audio context and source alive to avoid createMediaElementSource
      // InvalidStateError on re-renders/StrictMode.
    }
  }, [audioBlobUrl, isOpen])

  // Sync play/pause state and time
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoaded = () => setDuration(audio.duration || 0)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoaded)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioBlobUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

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

  const formatCompactTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0s'
    const total = Math.floor(seconds)
    const mins = Math.floor(total / 60)
    const secs = total % 60
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
  }

  if (!isOpen || !call) return null

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
        className={`fixed inset-0 backdrop-blur-sm z-40 animate-in fade-in duration-300 ${
          theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
        }`}
        onClick={onClose}
      />

      {/* Side Sheet */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl border-l z-50 shadow-2xl overflow-y-auto ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        }`}
        style={{
          animation: isOpen ? 'slide-in-from-right 0.3s ease-out' : 'none',
        }}
      >
        <div
          className={`sticky top-0 z-10 p-6 border-b backdrop-blur-sm ${
            theme === 'dark'
              ? 'border-gray-800 bg-gray-900/95'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Call Details
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
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
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Call not found
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Call Header */}
              <div
                className={`border rounded-2xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50'
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
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
                    {isOutbound ? (
                      <PhoneOutgoing
                        className={`size-8 ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}
                      />
                    ) : (
                      <PhoneIncoming
                        className={`size-8 ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {isOutbound ? 'Outbound Call' : 'Inbound Call'}
                    </h3>
                    <p
                      className={`text-sm font-semibold px-3 py-1 rounded-full inline-block border ${
                        call.status === 'completed'
                          ? theme === 'dark'
                            ? 'text-green-400 bg-green-500/10 border-green-500/20'
                            : 'text-green-700 bg-green-100 border-green-300'
                          : call.status === 'failed' || call.status === 'busy' || call.status === 'no-answer'
                          ? theme === 'dark'
                            ? 'text-red-400 bg-red-500/10 border-red-500/20'
                            : 'text-red-700 bg-red-100 border-red-300'
                          : theme === 'dark'
                          ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                          : 'text-blue-700 bg-blue-100 border-blue-300'
                      }`}
                    >
                      {call.status.replace('-', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Call Flow */}
                <div className="space-y-4">
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700/50'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                      >
                        <User className={`size-5 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        From
                      </p>
                      <p className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {callerName}
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {callerPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className={`w-0.5 h-8 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                  </div>

                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700/50'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                      >
                        <Phone className={`size-5 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        To
                      </p>
                      <p className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {receiverName}
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {receiverPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Player */}
              {recordingUrl && (
                <div
                  className={`border rounded-2xl p-6 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50'
                      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className={`size-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Recording
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <audio
                      ref={audioRef}
                      src={audioBlobUrl || undefined}
                      className="hidden"
                    />
                    <div
                      className={`h-16 rounded-lg border flex items-center px-4 ${
                        theme === 'dark'
                          ? 'bg-gray-900/50 border-gray-700'
                          : 'bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex-1 flex items-end gap-1 h-12">
                        {barValues.map((value, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t transition-[height,background-color,opacity] duration-150"
                            style={{
                              height: `${value}%`,
                              backgroundColor:
                                theme === 'dark'
                                  ? '#a78bfa'
                                  : '#9333ea',
                              opacity: 0.8
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {formatCompactTime(currentTime)}
                      </span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {formatCompactTime(duration)}
                      </span>
                    </div>
                    <button
                      onClick={togglePlay}
                      className={`w-full flex items-center justify-center gap-3 px-6 py-4 border-2 rounded-xl transition-all hover:scale-[1.02] font-semibold ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-white'
                          : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-700 shadow-sm'
                      }`}
                    >
                    {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Call Information */}
              <div
                className={`border rounded-2xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50'
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Call Information
                </h3>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between py-2 border-b ${
                    theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'
                  }`}>
                    <span className={`flex items-center gap-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Clock className="size-4" />
                      Duration
                    </span>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatDuration(call.duration_seconds)}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between py-2 border-b ${
                    theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'
                  }`}>
                    <span className={`flex items-center gap-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Calendar className="size-4" />
                      Started
                    </span>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatDateTime(call.started_at)}
                    </span>
                  </div>
                  {call.answered_at && (
                    <div className={`flex items-center justify-between py-2 border-b ${
                      theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'
                    }`}>
                      <span className={`flex items-center gap-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Phone className="size-4" />
                        Answered
                      </span>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatDateTime(call.answered_at)}
                      </span>
                    </div>
                  )}
                  {call.ended_at && (
                    <div className="flex items-center justify-between py-2">
                      <span className={`flex items-center gap-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <X className="size-4" />
                        Ended
                      </span>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatDateTime(call.ended_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* User POV */}
              <div
                className={`border rounded-2xl p-6 ${
                  theme === 'dark'
                    ? 'bg-purple-500/5 border-purple-500/20'
                    : 'bg-purple-50 border-purple-200'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  User POV
                </h3>
                <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
                  {call.user_pov_summary || 'User POV not available'}
                </p>
              </div>

              {/* Transcript */}
              {Array.isArray(call.transcript_json) && call.transcript_json.length > 0 ? (
                <div
                  className={`border rounded-2xl p-6 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50'
                      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
                  }`}
                >
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FileText className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={20} />
                    Structured Transcript
                  </h3>
                  <div className="space-y-3">
                    {call.transcript_json.map((message: any, idx: number) => {
                      const role = message?.role
                      const isAgent = role === 'assistant'
                      const colors = isAgent
                        ? {
                            bg: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50',
                            text: theme === 'dark' ? 'text-blue-100' : 'text-blue-900',
                            border: theme === 'dark' ? 'border-blue-500/20' : 'border-blue-200',
                            label: 'Agent',
                          }
                        : {
                            bg: theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50',
                            text: theme === 'dark' ? 'text-purple-100' : 'text-purple-900',
                            border: theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200',
                            label: 'User',
                          }

                      return (
                        <div key={`${message?.timestamp || idx}-${idx}`} className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                            <span className={colors.text}>{colors.label}</span>
                            {message?.timestamp && (
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                {new Date(message.timestamp).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className={`rounded-lg border p-3 ${colors.bg} ${colors.border} ${colors.text}`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{message?.content || ''}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : call.transcript ? (
                <div
                  className={`border rounded-2xl p-6 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50'
                      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
                  }`}
                >
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Transcript
                  </h3>
                  <div
                    className={`rounded-xl p-4 border ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700/50'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className={`whitespace-pre-wrap leading-relaxed ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {call.transcript}
                    </p>
                  </div>
                </div>
              ) : null}
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

