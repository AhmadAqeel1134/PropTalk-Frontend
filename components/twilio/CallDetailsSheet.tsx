'use client'

// Component: CallDetailsSheet
// Purpose: Side sheet with full call details, waveform audio player, and transcript

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Phone, Clock, User, Calendar, Download, 
  Play, Pause, Volume2, FileText, CheckCircle 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CallDetailsSheetProps {
  callId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CallDetailsSheet({ callId, isOpen, onClose }: CallDetailsSheetProps) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [barValues, setBarValues] = useState<number[]>(() => Array(32).fill(0));
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  const { data: call } = useQuery({
    queryKey: ['call', callId],
    queryFn: async () => {
      const { getCallById } = await import('@/lib/real_estate_agent/api');
      return getCallById(callId);
    },
    enabled: isOpen
  });

  // Fetch recording through backend (avoids direct Twilio auth prompt)
  useEffect(() => {
    if (!isOpen || !call?.recording_url) return;

    const fetchRecording = async () => {
      try {
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('agent_token') || localStorage.getItem('access_token')
          : null;
        if (!token) return;

        const proxiedUrl = `${API_URL}/agent/calls/${callId}/recording/stream`;
        const response = await fetch(proxiedUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setAudioBlobUrl(url);
        }
      } catch (error) {
        console.error('Error fetching recording:', error);
      }
    };

    fetchRecording();

    return () => {
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
        setAudioBlobUrl(null);
      }
    };
  }, [isOpen, call?.recording_url, callId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Hook audio element to analyser for live bar visualization
  const effectiveAudioSrc = audioBlobUrl ?? call?.recording_url ?? undefined;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !effectiveAudioSrc || !isOpen) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }
    const ctx = audioContextRef.current;

    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
    }

    // MediaElementAudioSourceNode can only be created once per media element.
    if (!mediaSourceRef.current) {
      mediaSourceRef.current = ctx.createMediaElementSource(audio);
      mediaSourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
    }

    const analyser = analyserRef.current!;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const barsCount = 32;

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      const bucketSize = Math.max(1, Math.floor(dataArray.length / barsCount));
      const nextBars: number[] = [];
      for (let i = 0; i < barsCount; i++) {
        const start = i * bucketSize;
        const end = Math.min(dataArray.length, start + bucketSize);
        let sum = 0;
        for (let j = start; j < end; j++) sum += dataArray[j];
        const avg = sum / (end - start || 1);
        const height = Math.max(8, (avg / 255) * 100); // 8–100%
        nextBars.push(height);
      }
      setBarValues(nextBars);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Keep the audio context alive; reusing it prevents createMediaElementSource errors.
    };
  }, [effectiveAudioSrc, isOpen]);

  // Reset timing/progress when we get a fresh blob URL
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    if (effectiveAudioSrc) {
      audio.load();
    }
    setIsPlaying(false);
  }, [effectiveAudioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!isOpen || !call) return null;

  const transcriptMessages = call.transcript_json || [];
  const hasStructuredTranscript = Array.isArray(transcriptMessages) && transcriptMessages.length > 0;

  return (
    <>
      <div
        className={`fixed inset-0 backdrop-blur-sm z-40 animate-in fade-in duration-300 ${
          theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
        }`}
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full md:w-[600px] z-50 animate-in slide-in-from-right duration-300">
        <div
          className={`border-l h-full overflow-y-auto ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}
        >
          <div
            className={`sticky top-0 z-10 p-6 border-b backdrop-blur-sm ${
              theme === 'dark'
                ? 'border-gray-800 bg-gray-900/95'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Call Details
                </h2>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  ID: {callId}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all hover:rotate-90 duration-300 ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <>
              <div
                className={`rounded-xl border p-6 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`p-3 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <User
                      className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
                      size={24}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {call.contact_name || 'Unknown Contact'}
                    </h3>
                    <p className={`font-mono text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {call.from_number}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-md border ${
                      theme === 'dark'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-green-100 border-green-300'
                    }`}
                  >
                    <span className={`text-sm font-medium capitalize ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-700'
                    }`}>
                      {call.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                      From
                    </p>
                    <p className={`font-mono ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {call.from_number}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                      To
                    </p>
                    <p className={`font-mono ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {call.to_number}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl border p-4 ${
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

              <div
                className={`rounded-xl border p-6 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Clock
                    className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}
                    size={20}
                  />
                  Call Timeline
                </h3>

                <div className="space-y-4">
                  {[
                    { label: 'Initiated', time: call.started_at || call.created_at, icon: Phone, color: 'blue' },
                    { label: 'Answered', time: call.answered_at || call.started_at || call.created_at, icon: CheckCircle, color: 'green' },
                    { label: 'Ended', time: call.ended_at, icon: Clock, color: 'gray' }
                  ].map((event, i) => {
                    const Icon = event.icon;
                    const colorClasses = {
                      blue: {
                        bg: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50',
                        border: theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200',
                        text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      },
                      green: {
                        bg: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50',
                        border: theme === 'dark' ? 'border-green-500/30' : 'border-green-200',
                        text: theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      },
                      gray: {
                        bg: theme === 'dark' ? 'bg-gray-500/10' : 'bg-gray-50',
                        border: theme === 'dark' ? 'border-gray-500/30' : 'border-gray-200',
                        text: theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }
                    };
                    const colors = colorClasses[event.color as keyof typeof colorClasses] || colorClasses.blue;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg border ${colors.bg} ${colors.border}`}>
                          <Icon className={colors.text} size={16} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {event.label}
                          </p>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {formatDateTime(event.time)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={`mt-4 pt-4 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Total Duration
                    </span>
                    <span className={`font-bold text-lg ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatTime(call.duration_seconds || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {call.recording_url && (
                <div
                    className={`rounded-xl border p-6 ${
                      theme === 'dark'
                        ? 'bg-gray-900/60 border-gray-800'
                        : 'bg-white border-gray-200 shadow-sm'
                    }`}
                >
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Volume2
                      className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}
                      size={20}
                    />
                    Recording
                  </h3>
                  <audio ref={audioRef} src={effectiveAudioSrc} preload="metadata" />

                  <div
                    className={`mb-4 h-16 rounded-lg border flex items-center px-4 ${
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
                              i / barValues.length < currentTime / (duration || 1)
                                ? theme === 'dark'
                                  ? '#a78bfa'
                                  : '#9333ea'
                                : theme === 'dark'
                                ? '#374151'
                                : '#d1d5db',
                            opacity: i / barValues.length < currentTime / (duration || 1) ? 1 : 0.3
                          }}
                        />
                      ))}
                    </div>
                  </div>

                    <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {formatTime(currentTime)}
                      </span>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {formatTime(duration)}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={togglePlay}
                        className={`flex-1 px-6 py-3 rounded-xl border font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                          theme === 'dark'
                            ? 'bg-gray-900 border-gray-700 hover:border-gray-600 text-gray-200'
                            : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </button>
                      <button
                        className={`px-6 py-3 rounded-xl border transition-all hover:scale-105 ${
                          theme === 'dark'
                            ? 'bg-gray-900 border-gray-700 hover:border-gray-600 text-gray-200'
                            : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {hasStructuredTranscript ? (
                <div
                  className={`rounded-xl border p-6 ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FileText
                      className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
                      size={20}
                    />
                    Structured Transcript
                  </h3>
                  <div className="space-y-3">
                    {transcriptMessages.map((message: any, idx: number) => {
                      const role = message?.role;
                      const isAgent = role === 'assistant';
                      const bubbleColors = isAgent
                        ? {
                            bg: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50',
                            text: theme === 'dark' ? 'text-blue-100' : 'text-blue-900',
                            border: theme === 'dark' ? 'border-blue-500/20' : 'border-blue-200',
                            label: 'Agent'
                          }
                        : {
                            bg: theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50',
                            text: theme === 'dark' ? 'text-purple-100' : 'text-purple-900',
                            border: theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200',
                            label: 'User'
                          };

                      return (
                        <div
                          key={`${message?.timestamp || idx}-${idx}`}
                          className="flex flex-col gap-1"
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                            <span className={bubbleColors.text}>{bubbleColors.label}</span>
                            {message?.timestamp && (
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                {new Date(message.timestamp).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div
                            className={`rounded-lg border p-3 ${bubbleColors.bg} ${bubbleColors.border} ${bubbleColors.text}`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">
                              {message?.content || ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : call.transcript ? (
                <div
                  className={`rounded-xl border p-6 ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FileText
                      className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
                      size={20}
                    />
                    Transcript
                  </h3>
                  <div
                    className={`p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <p className={`leading-relaxed whitespace-pre-wrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {call.transcript}
                    </p>
                  </div>
                </div>
              ) : null}
            </>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-from-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}

