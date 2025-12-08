'use client'

// Component: CallDetailsSheet
// Purpose: Side sheet with full call details, waveform audio player, and transcript

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Phone, Clock, User, Calendar, Download, 
  Play, Pause, Volume2, FileText, CheckCircle 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface CallDetailsSheetProps {
  callId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CallDetailsSheet({ callId, isOpen, onClose }: CallDetailsSheetProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: call } = useQuery({
    queryKey: ['call', callId],
    queryFn: async () => {
      const { getCallById } = await import('@/lib/real_estate_agent/api');
      return getCallById(callId);
    },
    enabled: isOpen
  });

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

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full md:w-[600px] z-50 animate-in slide-in-from-right duration-300">
        <div className="bg-gray-900 border-l border-gray-800 h-full overflow-y-auto">
          <div className="sticky top-0 z-10 p-6 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Call Details</h2>
                <p className="text-gray-400 text-sm">ID: {callId}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {call && (
              <>
                <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                      <User className="text-blue-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{call.contact_name || 'Unknown Contact'}</h3>
                      <p className="text-gray-400 font-mono text-sm">{call.from_number}</p>
                    </div>
                    <div className="px-3 py-1 rounded-md bg-green-500/10 border border-green-500/30">
                      <span className="text-green-400 text-sm font-medium capitalize">{call.status}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="text-gray-500">From</p>
                      <p className="text-white font-mono">{call.from_number}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500">To</p>
                      <p className="text-white font-mono">{call.to_number}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="text-purple-400" size={20} />
                    Call Timeline
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Initiated', time: call.started_at, icon: Phone, color: 'blue' },
                      { label: 'Answered', time: call.answered_at, icon: CheckCircle, color: 'green' },
                      { label: 'Ended', time: call.ended_at, icon: Clock, color: 'gray' }
                    ].map((event, i) => {
                      const Icon = event.icon;
                      return (
                        <div key={i} className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg bg-${event.color}-500/10 border border-${event.color}-500/30`}>
                            <Icon className={`text-${event.color}-400`} size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{event.label}</p>
                            <p className="text-gray-400 text-sm">
                              {event.time ? new Date(event.time).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Duration</span>
                      <span className="text-white font-bold text-lg">
                        {formatTime(call.duration_seconds || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {call.recording_url && (
                  <div className="rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Volume2 className="text-purple-400" size={20} />
                      Recording
                    </h3>
                    <audio ref={audioRef} src={call.recording_url} preload="metadata" />

                    <div className="mb-4 h-16 rounded-lg bg-gray-900/50 border border-gray-700 flex items-center px-4">
                      <div className="flex-1 flex items-end gap-1 h-12">
                        {Array.from({ length: 50 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t transition-all duration-150"
                            style={{
                              height: `${Math.random() * 100}%`,
                              backgroundColor: i / 50 < currentTime / duration ? '#a78bfa' : '#374151',
                              opacity: i / 50 < currentTime / duration ? 1 : 0.3
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
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
                        <span className="text-sm text-gray-400">{formatTime(duration)}</span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={togglePlay}
                          className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30"
                        >
                          <span className="flex items-center justify-center gap-2">
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            {isPlaying ? 'Pause' : 'Play'}
                          </span>
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white transition-all hover:scale-105">
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {call.transcript && (
                  <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText className="text-blue-400" size={20} />
                      Transcript
                    </h3>
                    <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {call.transcript}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
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

