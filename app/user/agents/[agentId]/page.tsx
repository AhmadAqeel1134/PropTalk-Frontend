'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@/contexts/ThemeContext'
import {
  getDirectoryAgent,
  getEndUserMe,
  listUserCallsForAgent,
  listUserShowingsForAgent,
  updateEndUserPhone,
  userChat,
  fetchUserRecordingBlob,
} from '@/lib/end_user/api'
import { ArrowLeft, Mic, Calendar, MessageSquare, Phone } from 'lucide-react'

type Tab = 'overview' | 'calls' | 'showings' | 'chat'

interface CallItem {
  id: string
  from_number: string
  to_number: string
  status: string
  direction: string
  duration_seconds: number
  recording_url: string | null
  transcript: string | null
  user_pov_summary: string | null
  created_at: string
}

interface ShowingItem {
  id: string
  scheduled_start: string
  status: string
  visit_type: string
  property_address: string | null
  caller_phone: string | null
}

export default function UserAgentDetailPage() {
  const params = useParams()
  const agentId = params.agentId as string
  const { theme } = useTheme()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('overview')
  const [phoneInput, setPhoneInput] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chatReply, setChatReply] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioForCall, setAudioForCall] = useState<string | null>(null)

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ['endUser', 'me'],
    queryFn: getEndUserMe,
  })

  const { data: agent } = useQuery({
    queryKey: ['endUser', 'agent', agentId],
    queryFn: () => getDirectoryAgent(agentId),
    enabled: !!agentId,
  })

  const hasPhone = !!(me?.phone_number && me.phone_number.length >= 10)

  const { data: callsData } = useQuery({
    queryKey: ['endUser', 'calls', agentId],
    queryFn: () => listUserCallsForAgent(agentId, 1, 50),
    enabled: !!agentId && hasPhone && tab === 'calls',
  })

  const { data: showingsData } = useQuery({
    queryKey: ['endUser', 'showings', agentId],
    queryFn: () => listUserShowingsForAgent(agentId, 1, 50),
    enabled: !!agentId && hasPhone && tab === 'showings',
  })

  const phoneMutation = useMutation({
    mutationFn: (phone: string) => updateEndUserPhone(phone),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['endUser', 'me'] })
      setPhoneInput('')
    },
  })

  const chatMutation = useMutation({
    mutationFn: (message: string) => userChat(agentId, message),
    onSuccess: (data) => {
      setChatReply(data.answer)
    },
  })

  const calls = useMemo(() => (callsData?.items || []) as CallItem[], [callsData])
  const showings = useMemo(() => (showingsData?.items || []) as ShowingItem[], [showingsData])

  const tabBtn = (t: Tab, label: string, icon: ReactNode) => (
    <button
      type="button"
      key={t}
      onClick={() => setTab(t)}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        tab === t
          ? theme === 'dark'
            ? 'bg-gray-800 text-white'
            : 'bg-blue-100 text-blue-800'
          : theme === 'dark'
            ? 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
            : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  const playRecording = async (callId: string, streamPath: string | null) => {
    try {
      const path = streamPath || `/user/agents/${agentId}/calls/${callId}/recording/stream`
      if (!path.startsWith('/')) return
      const blob = await fetchUserRecordingBlob(path)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setAudioForCall(callId)
    } catch {
      alert('Recording could not be loaded.')
    }
  }

  const heading = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const panel =
    theme === 'dark' ? 'rounded-xl border border-gray-800 bg-gray-900/60 p-5' : 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm'

  if (!agentId) return null

  return (
    <div>
      <Link
        href="/user"
        className={`mb-6 inline-flex items-center gap-2 text-sm ${muted} hover:underline`}
      >
        <ArrowLeft size={16} />
        All agents
      </Link>

      {agent && (
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${heading}`}>{agent.full_name}</h1>
          {agent.company_name && <p className={muted}>{agent.company_name}</p>}
          <p className={`mt-2 text-sm ${muted}`}>
            Voice assistant: {agent.voice_agent_name || '—'} ({agent.voice_agent_status || 'n/a'})
          </p>
        </div>
      )}

      {!meLoading && me && !hasPhone && (
        <div className={`mb-8 ${panel}`}>
          <h2 className={`mb-2 font-semibold ${heading}`}>Add your phone number</h2>
          <p className={`mb-4 text-sm ${muted}`}>
            We match your history by the phone you use with this agent (calls and showings). Your number is not
            shared on the public directory.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+1 …"
              className={`min-w-[220px] rounded-lg border px-3 py-2 text-sm ${
                theme === 'dark'
                  ? 'border-gray-700 bg-gray-950 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
            <button
              type="button"
              disabled={phoneMutation.isPending}
              onClick={() => phoneMutation.mutate(phoneInput)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {phoneMutation.isError && (
            <p className="mt-2 text-sm text-red-500">
              {(phoneMutation.error as Error)?.message || 'Could not save phone'}
            </p>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabBtn('overview', 'Overview', <Phone size={16} />)}
        {tabBtn('calls', 'Your calls', <Mic size={16} />)}
        {tabBtn('showings', 'Your showings', <Calendar size={16} />)}
        {tabBtn('chat', 'Ask (RAG soon)', <MessageSquare size={16} />)}
      </div>

      {tab === 'overview' && (
        <div className={panel}>
          <p className={muted}>
            Open <strong className={heading}>Your calls</strong> or <strong className={heading}>Your showings</strong>{' '}
            to see only activity between your saved phone number and this agent — not other users&apos; data.
          </p>
        </div>
      )}

      {tab === 'calls' && (
        <div className="space-y-3">
          {!hasPhone && <p className={muted}>Save your phone number above to load calls.</p>}
          {hasPhone && calls.length === 0 && <p className={muted}>No calls found for your number with this agent.</p>}
          {calls.map((c) => (
            <div key={c.id} className={panel}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className={`font-medium ${heading}`}>
                    {c.direction} · {c.status}
                  </p>
                  <p className={`text-sm ${muted}`}>
                    {c.from_number} → {c.to_number}
                  </p>
                  {c.user_pov_summary && <p className={`mt-2 text-sm ${muted}`}>{c.user_pov_summary}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {c.recording_url && (
                    <button
                      type="button"
                      onClick={() => playRecording(c.id, c.recording_url)}
                      className="rounded-lg border border-blue-500/50 px-3 py-1.5 text-sm text-blue-500 hover:bg-blue-500/10"
                    >
                      Play recording
                    </button>
                  )}
                </div>
              </div>
              <p className={`mt-2 text-xs ${muted}`}>{c.created_at}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'showings' && (
        <div className="space-y-3">
          {!hasPhone && <p className={muted}>Save your phone number above to load showings.</p>}
          {hasPhone && showings.length === 0 && (
            <p className={muted}>No showings found for your number with this agent.</p>
          )}
          {showings.map((s) => (
            <div key={s.id} className={panel}>
              <p className={`font-medium ${heading}`}>{s.visit_type} · {s.status}</p>
              <p className={`text-sm ${muted}`}>{s.scheduled_start}</p>
              {s.property_address && <p className={`text-sm ${muted}`}>{s.property_address}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'chat' && (
        <div className={panel}>
          {!hasPhone && <p className={muted}>Save your phone number to use chat (required for future RAG scoping).</p>}
          {hasPhone && (
            <>
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                rows={3}
                className={`mb-3 w-full rounded-lg border px-3 py-2 text-sm ${
                  theme === 'dark'
                    ? 'border-gray-700 bg-gray-950 text-white'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="Ask a question about this agent’s listings (RAG coming soon)…"
              />
              <button
                type="button"
                disabled={chatMutation.isPending || !chatInput.trim()}
                onClick={() => {
                  setChatReply(null)
                  chatMutation.mutate(chatInput.trim())
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
              {chatReply && (
                <div className={`mt-4 rounded-lg border p-3 text-sm ${theme === 'dark' ? 'border-gray-700 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
                  {chatReply}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {audioUrl && audioForCall && (
        <div className={`fixed bottom-6 right-6 z-50 ${panel} shadow-xl`}>
          <p className={`mb-2 text-xs ${muted}`}>Call {audioForCall.slice(0, 8)}…</p>
          <audio controls src={audioUrl} className="w-72" />
          <button
            type="button"
            className="mt-2 text-sm text-red-500 hover:underline"
            onClick={() => {
              URL.revokeObjectURL(audioUrl)
              setAudioUrl(null)
              setAudioForCall(null)
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
