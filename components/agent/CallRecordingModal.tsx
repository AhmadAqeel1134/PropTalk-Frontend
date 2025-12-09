// components/agent/CallRecordingModal.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Play, Pause, Download, Volume2, User, Bot, Clock } from 'lucide-react'
import { getCallById, getCallRecording, getCallTranscript } from '@/lib/real_estate_agent/api'
import { useTheme } from '@/contexts/ThemeContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string | null
}

interface CallRecordingModalProps {
  callId: string
  isOpen: boolean
  onClose: () => void
}

export default function CallRecordingModal({ callId, isOpen, onClose }: CallRecordingModalProps) {
  const { theme } = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [highlightedMessageIndex, setHighlightedMessageIndex] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: call } = useQuery({
    queryKey: ['agent', 'call', callId],
    queryFn: () => getCallById(callId),
    enabled: isOpen && !!callId,
  })

  const { data: recording } = useQuery({
    queryKey: ['agent', 'call', callId, 'recording'],
    queryFn: () => getCallRecording(callId),
    enabled: isOpen && !!callId && !!call?.recording_url,
  })

  // Fetch conversation history
  const { data: conversationData } = useQuery({
    queryKey: ['agent', 'call', callId, 'conversation'],
    queryFn: async () => {
      const token = localStorage.getItem('agent_token') || localStorage.getItem('access_token')
      if (!token) throw new Error('No token')
      
      const response = await fetch(`${API_URL}/agent/calls/${callId}/conversation-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        // Fallback to transcript if conversation history not available
        if (call?.transcript) {
          return {
            history: parseTranscriptToMessages(call.transcript, call.direction || 'outbound'),
            source: 'parsed'
          }
        }
        return { history: [], source: 'none' }
      }
      
      return response.json()
    },
    enabled: isOpen && !!callId,
  })

  const messages: ConversationMessage[] = conversationData?.history || []

  // Get recording URL
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

  // Fetch recording as blob
  useEffect(() => {
    if (isOpen && recordingUrl && call?.recording_url) {
      const fetchRecording = async () => {
        try {
          const token = localStorage.getItem('agent_token') || localStorage.getItem('access_token')
          if (!token) return

          const response = await fetch(recordingUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
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
    }

    return () => {
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl)
        setAudioBlobUrl(null)
      }
    }
  }, [isOpen, recordingUrl, call?.recording_url])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
      
      // Highlight current message based on time
      if (messages.length > 0 && audio.duration) {
        const progress = audio.currentTime / audio.duration
        const messageIndex = Math.floor(progress * messages.length)
        setHighlightedMessageIndex(Math.min(messageIndex, messages.length - 1))
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      setHighlightedMessageIndex(null)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [messages.length])

  // Auto-scroll to highlighted message
  useEffect(() => {
    if (highlightedMessageIndex !== null && messagesEndRef.current) {
      const messageElement = document.getElementById(`message-${highlightedMessageIndex}`)
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [highlightedMessageIndex])

  // Scroll to bottom on mount
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [isOpen, messages.length])

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownload = async () => {
    if (!recordingUrl) return
    try {
      const token = localStorage.getItem('agent_token') || localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(recordingUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `recording_${callId}.mp3`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading recording:', error)
    }
  }

  if (!isOpen) return null

  const isOutbound = call?.direction === 'outbound'
  const callerName = isOutbound
    ? (call?.voice_agent_name || 'Voice Agent')
    : (call?.contact_name || 'Unknown Caller')

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 backdrop-blur-sm z-50 animate-in fade-in duration-300 ${
          theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`sticky top-0 z-10 p-6 border-b backdrop-blur-sm rounded-t-2xl ${
              theme === 'dark'
                ? 'border-gray-800 bg-gray-900/95'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Call Recording
                </h2>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {callerName} • {formatTime(duration)} • {call?.status?.toUpperCase()}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Audio Player Controls */}
            {recordingUrl && (
              <div className="mt-4 space-y-3">
                <audio
                  ref={audioRef}
                  src={audioBlobUrl || undefined}
                  onEnded={() => setIsPlaying(false)}
                />

                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-white'
                        : 'bg-white border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 shadow-sm'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="size-6" />
                    ) : (
                      <Play className="size-6 ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-800 accent-gray-600 hover:accent-gray-500'
                          : 'bg-gray-200 accent-blue-600 hover:accent-blue-500'
                      }`}
                    />
                    <div className={`flex justify-between text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className={`px-4 py-2 border rounded-xl transition-all flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                        : 'bg-white border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 shadow-sm'
                    }`}
                  >
                    <Download className="size-4" />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div
            className={`flex-1 overflow-y-auto p-6 space-y-4 ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-gray-900 to-gray-950'
                : 'bg-gradient-to-b from-gray-50 to-white'
            }`}
          >
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  No conversation history available
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isUser = message.role === 'user'
                const isHighlighted = highlightedMessageIndex === index

                return (
                  <div
                    key={index}
                    id={`message-${index}`}
                    className={`flex items-start gap-3 transition-all duration-300 ${
                      isHighlighted ? 'scale-[1.02]' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        isUser
                          ? theme === 'dark'
                            ? 'bg-blue-500/20 border-blue-500/50'
                            : 'bg-blue-100 border-blue-300'
                          : theme === 'dark'
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-purple-100 border-purple-300'
                      } ${
                        isHighlighted
                          ? theme === 'dark'
                            ? 'ring-2 ring-white/50'
                            : 'ring-2 ring-blue-500/30'
                          : ''
                      }`}
                    >
                      {isUser ? (
                        <User className={`size-5 ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      ) : (
                        <Bot className={`size-5 ${
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`flex-1 rounded-2xl p-4 transition-all duration-300 ${
                        isUser
                          ? theme === 'dark'
                            ? 'bg-blue-500/10 border border-blue-500/20 ml-auto max-w-[80%]'
                            : 'bg-blue-50 border border-blue-200 ml-auto max-w-[80%]'
                          : theme === 'dark'
                          ? 'bg-purple-500/10 border border-purple-500/20 mr-auto max-w-[80%]'
                          : 'bg-purple-50 border border-purple-200 mr-auto max-w-[80%]'
                      } ${
                        isHighlighted
                          ? isUser
                            ? theme === 'dark'
                              ? 'bg-blue-500/20 border-blue-500/40 shadow-lg shadow-blue-500/20'
                              : 'bg-blue-100 border-blue-300 shadow-lg shadow-blue-500/20'
                            : theme === 'dark'
                            ? 'bg-purple-500/20 border-purple-500/40 shadow-lg shadow-purple-500/20'
                            : 'bg-purple-100 border-purple-300 shadow-lg shadow-purple-500/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-semibold ${
                            isUser
                              ? theme === 'dark'
                                ? 'text-blue-400'
                                : 'text-blue-700'
                              : theme === 'dark'
                              ? 'text-purple-400'
                              : 'text-purple-700'
                          }`}
                        >
                          {isUser ? (call?.contact_name || 'User') : (call?.voice_agent_name || 'Voice Agent')}
                        </span>
                        {message.timestamp && (
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            <Clock className="size-3 inline mr-1" />
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </>
  )
}

// Helper function to parse plain text transcript into messages
function parseTranscriptToMessages(transcript: string, direction: string): ConversationMessage[] {
  const messages: ConversationMessage[] = []
  
  // Split by common sentence endings
  const sentences = transcript
    .split(/[.!?]\s+|\.\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 3)
  
  // Alternate between user and agent
  let isAgentTurn = direction === 'outbound' // Outbound starts with agent
  
  for (const sentence of sentences) {
    messages.push({
      role: isAgentTurn ? 'assistant' : 'user',
      content: sentence,
      timestamp: null
    })
    isAgentTurn = !isAgentTurn
  }
  
  return messages
}

