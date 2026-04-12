'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  X, Play, Pause, Check, Volume2, Mic2, Sliders,
  Loader2, Sparkles, Search, AlertTriangle
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@/contexts/ThemeContext'
import { previewVoice, updateVoiceAgent } from '@/lib/real_estate_agent/api'
import { invalidateVoiceAgentQueries } from '@/hooks/useAgent'
import voices, { type ElevenLabsVoice } from '@/lib/voice/elevenlabsVoices'

interface Props {
  isOpen: boolean
  onClose: () => void
  currentVoiceId?: string
  currentSettings?: {
    elevenlabs_speed?: number
    elevenlabs_stability?: number
    elevenlabs_similarity_boost?: number
  }
}

type GenderFilter = 'all' | 'male' | 'female'

export default function VoiceStudioModal({
  isOpen,
  onClose,
  currentVoiceId,
  currentSettings,
}: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const queryClient = useQueryClient()

  const [selectedId, setSelectedId] = useState(currentVoiceId || voices[0].id)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [speed, setSpeed] = useState(currentSettings?.elevenlabs_speed ?? 1.0)
  const [stability, setStability] = useState(currentSettings?.elevenlabs_stability ?? 0.5)
  const [similarity, setSimilarity] = useState(currentSettings?.elevenlabs_similarity_boost ?? 0.75)
  const [showTuning, setShowTuning] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSelectedId(currentVoiceId || voices[0].id)
      setSpeed(currentSettings?.elevenlabs_speed ?? 1.0)
      setStability(currentSettings?.elevenlabs_stability ?? 0.5)
      setSimilarity(currentSettings?.elevenlabs_similarity_boost ?? 0.75)
      setSaved(false)
      setPreviewError(null)
      setSaveError(null)
    }
  }, [isOpen, currentVoiceId, currentSettings])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setPlayingId(null)
  }, [])

  const handlePreview = useCallback(
    async (voiceId: string) => {
      if (playingId === voiceId) {
        stopAudio()
        return
      }
      stopAudio()
      setLoadingId(voiceId)
      setPreviewError(null)
      try {
        const res = await previewVoice({ voice_id: voiceId, speed, stability, similarity_boost: similarity })
        const audio = new Audio(res.preview_url)
        audioRef.current = audio
        audio.onended = () => setPlayingId(null)
        audio.onerror = () => { setPlayingId(null); setLoadingId(null) }
        await audio.play()
        setPlayingId(voiceId)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Preview failed'
        setPreviewError(msg)
      } finally {
        setLoadingId(null)
      }
    },
    [playingId, speed, stability, similarity, stopAudio]
  )

  const saveMutation = useMutation({
    mutationFn: async () => {
      return updateVoiceAgent({
        settings: {
          elevenlabs_voice_id: selectedId,
          elevenlabs_speed: speed,
          elevenlabs_stability: stability,
          elevenlabs_similarity_boost: similarity,
        },
      })
    },
    onSuccess: () => {
      invalidateVoiceAgentQueries(queryClient)
      setSaveError(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
    onError: (e: unknown) => {
      setSaveError(e instanceof Error ? e.message : 'Could not save voice settings')
    },
  })

  useEffect(() => {
    return () => stopAudio()
  }, [stopAudio])

  if (!isOpen) return null

  const filtered = voices.filter((v) => {
    if (genderFilter !== 'all' && v.gender !== genderFilter) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return (
        v.name.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q)) ||
        v.description.toLowerCase().includes(q)
      )
    }
    return true
  })

  const selectedVoice = voices.find((v) => v.id === selectedId)

  const cardBase = isDark
    ? 'bg-gray-800/60 border-gray-700/60 hover:border-gray-600'
    : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
  const cardSelected = isDark
    ? 'ring-2 ring-blue-500 border-blue-500/60 bg-blue-500/5'
    : 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/60'

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
        onClick={() => { stopAudio(); onClose() }}
      />

      {/* modal */}
      <div className="fixed inset-4 sm:inset-8 lg:inset-y-10 lg:inset-x-20 z-[61] animate-in zoom-in-95 fade-in duration-300 flex">
        <div
          className={`w-full rounded-2xl border flex flex-col overflow-hidden ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
          }`}
        >
          {/* ─── Header ─── */}
          <div
            className={`flex-shrink-0 px-6 py-5 border-b flex items-center justify-between ${
              isDark ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                <Mic2 className={isDark ? 'text-blue-400' : 'text-blue-600'} size={22} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Voice Studio
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose the voice your agent uses on calls
                </p>
              </div>
            </div>
            <button
              onClick={() => { stopAudio(); onClose() }}
              className={`p-2 rounded-lg transition-all hover:rotate-90 duration-300 ${
                isDark
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'
              }`}
            >
              <X size={22} />
            </button>
          </div>

          {(previewError || saveError) && (
            <div
              className={`mx-6 mt-3 px-4 py-3 rounded-xl text-sm flex items-start gap-2 border ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-medium">ElevenLabs / save</p>
                <p className="opacity-90 mt-0.5">{previewError || saveError}</p>
                {previewError?.toLowerCase().includes('paid') ||
                previewError?.toLowerCase().includes('free users') ? (
                  <p className={`mt-2 text-xs ${isDark ? 'text-amber-300/80' : 'text-amber-800'}`}>
                    Free ElevenLabs accounts often cannot use premade &quot;library&quot; voices over the API.
                    Upgrade your ElevenLabs plan, or use a voice that works on your tier — then click Save Voice to store your choice.
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {/* ─── Toolbar ─── */}
          <div
            className={`flex-shrink-0 px-6 py-3 border-b flex flex-wrap items-center gap-3 ${
              isDark ? 'border-gray-800/60 bg-gray-900/40' : 'border-gray-100 bg-white/80'
            }`}
          >
            {/* search */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search voices..."
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500/30'
                    : 'bg-white border-gray-200 text-gray-900 focus:ring-blue-500/20 shadow-sm'
                }`}
              />
            </div>

            {/* gender filter chips */}
            <div className="flex gap-1.5">
              {(['all', 'male', 'female'] as GenderFilter[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all capitalize ${
                    genderFilter === g
                      ? isDark
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                        : 'bg-blue-100 border-blue-300 text-blue-700'
                      : isDark
                      ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* tuning toggle */}
            <button
              onClick={() => setShowTuning(!showTuning)}
              className={`ml-auto flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                showTuning
                  ? isDark
                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-400'
                    : 'bg-purple-100 border-purple-300 text-purple-700'
                  : isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm'
              }`}
            >
              <Sliders size={14} /> Tuning
            </button>
          </div>

          {/* ─── Body ─── */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex flex-col lg:flex-row gap-6">
              {/* Voice grid */}
              <div className="flex-1">
                {filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <AlertTriangle className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={32} />
                    <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No voices match your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filtered.map((v) => {
                      const isSelected = v.id === selectedId
                      const isPlaying = playingId === v.id
                      const isLoading = loadingId === v.id
                      return (
                        <div
                          key={v.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedId(v.id)}
                          onKeyDown={(e) => e.key === 'Enter' && setSelectedId(v.id)}
                          aria-pressed={isSelected}
                          className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                            isSelected ? cardSelected : cardBase
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <Check size={16} className="text-blue-500" />
                            </div>
                          )}

                          <div className="flex items-center gap-3 mb-2.5">
                            {/* avatar */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                v.gender === 'female'
                                  ? isDark
                                    ? 'bg-pink-500/15 text-pink-400'
                                    : 'bg-pink-100 text-pink-600'
                                  : isDark
                                  ? 'bg-sky-500/15 text-sky-400'
                                  : 'bg-sky-100 text-sky-600'
                              }`}
                            >
                              {v.name[0]}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {v.name}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {v.gender === 'female' ? 'Female' : 'Male'} &middot; {v.accent}
                              </p>
                            </div>

                            {/* play button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePreview(v.id) }}
                              disabled={isLoading}
                              className={`p-2 rounded-lg transition-all ${
                                isPlaying
                                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                  : isDark
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                              }`}
                            >
                              {isLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : isPlaying ? (
                                <Pause size={16} />
                              ) : (
                                <Play size={16} />
                              )}
                            </button>
                          </div>

                          <p className={`text-xs leading-relaxed mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {v.description}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {v.tags.map((t) => (
                              <span
                                key={t}
                                className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                  isDark
                                    ? 'bg-gray-700/60 text-gray-400'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Tuning sidebar */}
              {showTuning && (
                <div
                  className={`w-full lg:w-72 flex-shrink-0 p-5 rounded-xl border space-y-6 animate-in slide-in-from-right-5 duration-200 ${
                    isDark ? 'bg-gray-800/40 border-gray-700/60' : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                    <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Voice Tuning
                    </h3>
                  </div>

                  <SliderControl
                    label="Speed"
                    value={speed}
                    min={0.7}
                    max={1.3}
                    step={0.05}
                    onChange={setSpeed}
                    isDark={isDark}
                    hint={speed < 0.9 ? 'Slower' : speed > 1.1 ? 'Faster' : 'Normal'}
                  />
                  <SliderControl
                    label="Stability"
                    value={stability}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={setStability}
                    isDark={isDark}
                    hint={stability < 0.3 ? 'Expressive' : stability > 0.7 ? 'Stable' : 'Balanced'}
                  />
                  <SliderControl
                    label="Clarity"
                    value={similarity}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={setSimilarity}
                    isDark={isDark}
                    hint={similarity < 0.4 ? 'More creative' : similarity > 0.8 ? 'Most similar' : 'Natural'}
                  />

                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Changes apply to previews and future calls. Hit <strong>Play</strong> on any card to hear your tuning.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Footer ─── */}
          <div
            className={`flex-shrink-0 px-6 py-4 border-t flex items-center justify-between ${
              isDark ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {selectedVoice && (
                <>
                  <Volume2 size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Selected: <strong>{selectedVoice.name}</strong>
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { stopAudio(); onClose() }}
                className={`px-5 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                  isDark
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSaveError(null)
                  saveMutation.mutate()
                }}
                disabled={saveMutation.isPending}
                className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  saved
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                }`}
              >
                {saveMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saved ? (
                  <Check size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
                {saved ? 'Saved!' : 'Save Voice'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  isDark,
  hint,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  isDark: boolean
  hint?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </span>
        <span className={`text-xs tabular-nums ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {value.toFixed(2)} {hint && <span className="ml-1 opacity-70">({hint})</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500 bg-gray-300 dark:bg-gray-700"
      />
    </div>
  )
}
