'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTheme } from '@/contexts/ThemeContext'
import PageTransition from '@/components/common/PageTransition'
import UserCallDetailsSheet from '@/components/user/UserCallDetailsSheet'
import UserShowingDetailsSheet from '@/components/user/UserShowingDetailsSheet'
import {
  getDirectoryAgent,
  getEndUserMe,
  listUserCallsForAgent,
  listUserShowingsForAgent,
  userChat,
} from '@/lib/end_user/api'
import {
  ArrowLeft,
  Mic,
  Calendar,
  MessageSquare,
  LayoutDashboard,
  Radio,
  Loader2,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneOff,
  PhoneCall,
  Clock,
  User,
  FileText,
  MapPin,
  Home,
  Eye,
  CalendarCheck,
} from 'lucide-react'

type Tab = 'overview' | 'calls' | 'showings' | 'chat'

interface CallItem {
  id: string
  from_number: string
  to_number: string
  voice_agent_name?: string | null
  contact_name?: string | null
  contact_phone?: string | null
  twilio_phone_number?: string | null
  status: string
  direction: string
  duration_seconds: number
  recording_url: string | null
  transcript?: string | null
  transcript_json?: unknown[] | null
  user_pov_summary: string | null
  created_at: string
  started_at?: string | null
}

interface ShowingItem {
  id: string
  scheduled_start: string
  status: string
  visit_type: string
  property_address: string | null
  property_city?: string | null
  caller_phone: string | null
  contact_name?: string | null
  source?: string
}

export default function UserAgentDetailPage() {
  const params = useParams()
  const agentId = params.agentId as string
  const { theme } = useTheme()
  const [tab, setTab] = useState<Tab>('overview')
  const [chatInput, setChatInput] = useState('')
  const [chatReply, setChatReply] = useState<string | null>(null)
  const [callsPage, setCallsPage] = useState(1)
  const [showingsPage, setShowingsPage] = useState(1)
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)
  const [selectedShowingId, setSelectedShowingId] = useState<string | null>(null)
  const [listMounted, setListMounted] = useState(false)

  useEffect(() => {
    setListMounted(true)
  }, [])

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

  const {
    data: callsData,
    isError: callsQueryError,
    error: callsQueryErr,
    isFetching: callsLoading,
  } = useQuery({
    queryKey: ['endUser', 'calls', agentId, callsPage],
    queryFn: () => listUserCallsForAgent(agentId, callsPage, 20),
    enabled: !!agentId && hasPhone && tab === 'calls',
  })

  const {
    data: showingsData,
    isError: showingsQueryError,
    error: showingsQueryErr,
    isFetching: showingsLoading,
  } = useQuery({
    queryKey: ['endUser', 'showings', agentId, showingsPage],
    queryFn: () => listUserShowingsForAgent(agentId, showingsPage, 20),
    enabled: !!agentId && hasPhone && tab === 'showings',
  })

  const chatMutation = useMutation({
    mutationFn: (message: string) => userChat(agentId, message),
    onSuccess: (data) => {
      setChatReply(data.answer)
    },
  })

  const calls = useMemo(() => (callsData?.items || []) as CallItem[], [callsData])
  const showings = useMemo(() => (showingsData?.items || []) as ShowingItem[], [showingsData])
  const callsTotal = callsData?.total ?? 0
  const showingsTotal = showingsData?.total ?? 0
  const pageSize = 20

  const isDark = theme === 'dark'
  const heading = isDark ? 'text-white' : 'text-gray-900'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'
  const panel =
    isDark
      ? 'rounded-xl border border-gray-800/90 bg-gray-900/50 p-5 shadow-sm'
      : 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm'

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
    if (isDark) {
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
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatRelativeDate = (dateString: string) => {
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const tabBtn = (t: Tab, label: string, icon: ReactNode) => {
    const active = tab === t
    return (
      <button
        type="button"
        key={t}
        onClick={() => {
          setTab(t)
          if (t === 'calls') setCallsPage(1)
          if (t === 'showings') setShowingsPage(1)
        }}
        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
          active
            ? isDark
              ? 'border border-blue-500/40 bg-gradient-to-r from-blue-600/25 to-blue-800/20 text-white shadow-md shadow-blue-900/20'
              : 'border border-blue-200 bg-blue-50 text-blue-900 shadow-sm'
            : isDark
              ? 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
              : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {icon}
        {label}
      </button>
    )
  }

  if (!agentId) return null

  return (
    <PageTransition>
      <div className="max-w-full">
        <Link
          href="/user"
          className={`mb-6 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            isDark
              ? 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-900 hover:text-white'
              : 'border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-800'
          }`}
        >
          <ArrowLeft size={16} />
          All agents
        </Link>

        {agent && (
          <div
            className={`mb-8 rounded-2xl border p-6 md:p-8 backdrop-blur-sm shadow-xl ${
              isDark
                ? 'border-gray-800/80 bg-gradient-to-br from-gray-900/95 to-gray-950/90'
                : 'border-gray-200/90 bg-gradient-to-br from-white to-slate-50/95'
            }`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-blue-400/90' : 'text-blue-600'
                  }`}
                >
                  Agent workspace
                </p>
                <h1 className={`mt-1 text-2xl font-bold md:text-3xl ${heading}`}>{agent.full_name}</h1>
                {agent.company_name && <p className={`mt-1 ${muted}`}>{agent.company_name}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${
                      isDark ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    <Radio size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                    {agent.voice_agent_name || 'Voice agent'}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    {agent.voice_agent_status || 'n/a'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!meLoading && me && !hasPhone && (
          <div
            className={`mb-8 rounded-xl border p-5 ${
              isDark ? 'border-amber-900/40 bg-amber-950/20' : 'border-amber-200 bg-amber-50/80'
            }`}
          >
            <p className={`text-sm ${isDark ? 'text-amber-100/90' : 'text-amber-900'}`}>
              Add your phone number under <strong>My phone</strong> in the sidebar so we can match your calls and
              showings with this agent (same number you use on the phone with them).
            </p>
          </div>
        )}

        <div
          className={`mb-8 flex flex-wrap gap-2 rounded-2xl border p-2 ${
            isDark ? 'border-gray-800/80 bg-gray-950/40' : 'border-gray-200 bg-gray-50/80'
          }`}
        >
          {tabBtn('overview', 'Overview', <LayoutDashboard size={17} />)}
          {tabBtn('calls', 'Your calls', <Mic size={17} />)}
          {tabBtn('showings', 'Showings', <Calendar size={17} />)}
          {tabBtn('chat', 'Ask the agent', <MessageSquare size={17} />)}
        </div>

        {tab === 'overview' && (
          <div className={panel}>
            <p className={`leading-relaxed ${muted}`}>
              Use the tabs above to see <strong className={heading}>calls</strong>,{' '}
              <strong className={heading}>showings</strong>, or <strong className={heading}>Ask the agent</strong> for
              document-based answers. Everything is filtered to your saved phone — other clients never see your data.
            </p>
          </div>
        )}

        {tab === 'calls' && (
          <div className="space-y-4">
            {!hasPhone && (
              <p
                className={`rounded-xl border p-4 text-sm ${isDark ? 'border-gray-800 bg-gray-900/40' : 'border-gray-200 bg-white'} ${muted}`}
              >
                Add your number under <strong className={heading}>My phone</strong> in the sidebar to load calls.
              </p>
            )}
            {hasPhone && callsLoading && (
              <div className={`flex items-center gap-2 text-sm ${muted}`}>
                <Loader2 className="animate-spin" size={18} />
                Loading calls…
              </div>
            )}
            {hasPhone && callsQueryError && (
              <p className="rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-300">
                {(callsQueryErr as Error)?.message || 'Could not load calls'}
              </p>
            )}
            {hasPhone && !callsQueryError && !callsLoading && calls.length === 0 && (
              <div
                className={`text-center py-16 border-2 rounded-2xl ${
                  isDark ? 'border-gray-800/50 bg-gray-900/40' : 'border-gray-200 bg-white shadow-sm'
                }`}
              >
                <Phone className={`size-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-400'}`} />
                <p className={`text-sm ${muted}`}>No calls found for your number with this agent yet.</p>
              </div>
            )}
            {calls.map((c, index) => {
              const StatusIcon = getStatusIcon(c.status, c.direction)
              const isOutbound = c.direction === 'outbound'
              const callerName = isOutbound
                ? c.voice_agent_name || 'Voice Agent'
                : c.contact_name || 'Unknown Caller'
              const callerPhone = isOutbound
                ? c.twilio_phone_number || c.from_number
                : c.contact_phone || c.from_number
              const receiverName = isOutbound
                ? c.contact_name || c.to_number
                : c.voice_agent_name || 'Voice Agent'
              const receiverPhone = isOutbound
                ? c.contact_phone || c.to_number
                : c.twilio_phone_number || c.to_number
              const hasTranscript =
                !!(c.transcript && c.transcript.length > 0) ||
                !!(Array.isArray(c.transcript_json) && c.transcript_json.length > 0)
              const dateRef = c.started_at || c.created_at

              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCallId(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedCallId(c.id)
                    }
                  }}
                  className={`group relative border-2 rounded-2xl p-6 backdrop-blur-sm shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isDark
                      ? 'bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-gray-800/50 hover:border-gray-700'
                      : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
                  } ${listMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${Math.min(index * 40, 400)}ms` }}
                >
                  <div className="relative flex items-start gap-6">
                    <div
                      className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                        c.status === 'completed'
                          ? isDark
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-green-100 border-green-300'
                          : c.status === 'failed' || c.status === 'busy' || c.status === 'no-answer'
                            ? isDark
                              ? 'bg-red-500/10 border-red-500/30'
                              : 'bg-red-100 border-red-300'
                            : isDark
                              ? 'bg-blue-500/10 border-blue-500/30'
                              : 'bg-blue-100 border-blue-300'
                      }`}
                    >
                      <StatusIcon
                        className={`size-6 ${
                          c.status === 'completed'
                            ? isDark
                              ? 'text-green-400'
                              : 'text-green-600'
                            : c.status === 'failed' || c.status === 'busy' || c.status === 'no-answer'
                              ? isDark
                                ? 'text-red-400'
                                : 'text-red-600'
                              : isDark
                                ? 'text-blue-400'
                                : 'text-blue-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <h3 className={`text-lg font-bold ${heading}`}>
                          {isOutbound ? (
                            <>
                              <span className={muted}>{callerName}</span>
                              <span className="mx-2">→</span>
                              <span>{receiverName}</span>
                            </>
                          ) : (
                            <>
                              <span>{callerName}</span>
                              <span className="mx-2">→</span>
                              <span className={muted}>{receiverName}</span>
                            </>
                          )}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${getStatusColor(c.status)}`}
                        >
                          {c.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${muted}`}>
                        <span className="flex items-center gap-1.5">
                          <User size={14} /> {callerPhone}
                        </span>
                        {c.duration_seconds > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} /> {formatDuration(c.duration_seconds)}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} /> {formatRelativeDate(dateRef)}
                        </span>
                        {c.recording_url && (
                          <span
                            className={`flex items-center gap-1 text-xs font-medium ${
                              isDark ? 'text-violet-400' : 'text-violet-600'
                            }`}
                          >
                            <Mic size={14} />
                            Recording
                          </span>
                        )}
                        {hasTranscript && (
                          <span
                            className={`flex items-center gap-1 text-xs font-medium ${
                              isDark ? 'text-sky-400' : 'text-sky-600'
                            }`}
                          >
                            <FileText size={14} />
                            Transcript
                          </span>
                        )}
                      </div>
                      {c.user_pov_summary && (
                        <p className={`mt-3 text-sm leading-relaxed line-clamp-2 ${muted}`}>{c.user_pov_summary}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCallId(c.id)
                      }}
                      className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                        isDark
                          ? 'border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                      aria-label="Open call details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              )
            })}

            {hasPhone && !callsQueryError && !callsLoading && callsTotal > pageSize && (
              <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <div className={`text-sm ${muted}`}>
                  Showing {(callsPage - 1) * pageSize + 1} to {Math.min(callsPage * pageSize, callsTotal)} of{' '}
                  {callsTotal} calls
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCallsPage((p) => Math.max(1, p - 1))}
                    disabled={callsPage === 1}
                    className={`px-4 py-2 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallsPage((p) => p + 1)}
                    disabled={callsPage * pageSize >= callsTotal}
                    className={`px-4 py-2 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'showings' && (
          <div className="space-y-4">
            {!hasPhone && (
              <p
                className={`rounded-xl border p-4 text-sm ${isDark ? 'border-gray-800 bg-gray-900/40' : 'border-gray-200 bg-white'} ${muted}`}
              >
                Add your number under <strong className={heading}>My phone</strong> in the sidebar to load showings.
              </p>
            )}
            {hasPhone && showingsLoading && (
              <div className={`flex items-center gap-2 text-sm ${muted}`}>
                <Loader2 className="animate-spin" size={18} />
                Loading showings…
              </div>
            )}
            {hasPhone && showingsQueryError && (
              <p className="rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-300">
                {(showingsQueryErr as Error)?.message || 'Could not load showings'}
              </p>
            )}
            {hasPhone && !showingsQueryError && !showingsLoading && showings.length === 0 && (
              <div
                className={`text-center py-16 border-2 rounded-2xl ${
                  isDark ? 'border-gray-800/50 bg-gray-900/40' : 'border-gray-200 bg-white shadow-sm'
                }`}
              >
                <CalendarCheck className={`size-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-400'}`} />
                <p className={`text-sm ${muted}`}>No showings found for your number with this agent yet.</p>
              </div>
            )}
            {showings.map((s, index) => (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedShowingId(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedShowingId(s.id)
                  }
                }}
                className={`group relative border-2 rounded-2xl p-6 backdrop-blur-sm shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  isDark
                    ? 'bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-gray-800/50 hover:border-gray-700'
                    : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
                } ${listMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${Math.min(index * 40, 400)}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-6 flex-1 min-w-0">
                    <div
                      className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center text-center border-2 ${
                        isDark
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                          : 'bg-blue-100 border-blue-300 text-blue-700'
                      }`}
                    >
                      <span className="text-xs font-medium leading-none">
                        {new Date(s.scheduled_start).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold leading-tight">
                        {new Date(s.scheduled_start).getDate()}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className={`text-lg font-bold truncate ${heading}`}>
                          {s.property_address || 'Property TBD'}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            isDark ? 'border-gray-600 text-gray-300 bg-gray-800/80' : 'border-gray-200 text-gray-700 bg-gray-50'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${muted}`}>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />{' '}
                          {new Date(s.scheduled_start).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                        {(s.contact_name || s.caller_phone) && (
                          <span className="flex items-center gap-1.5">
                            <User size={14} /> {s.contact_name || s.caller_phone}
                          </span>
                        )}
                        {s.property_city && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} /> {s.property_city}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Home size={14} /> {s.visit_type.replace('_', ' ')}
                        </span>
                        {s.source?.startsWith('voice') && (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              s.source === 'voice_outbound'
                                ? isDark
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-purple-50 text-purple-600'
                                : isDark
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {s.source === 'voice_outbound' ? 'Outbound' : 'Inbound'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedShowingId(s.id)
                    }}
                    className={`p-2.5 rounded-xl border transition-all self-start md:self-center ${
                      isDark
                        ? 'border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                    aria-label="Open showing details"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}

            {hasPhone && !showingsQueryError && !showingsLoading && showingsTotal > pageSize && (
              <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <div className={`text-sm ${muted}`}>
                  Showing {(showingsPage - 1) * pageSize + 1} to {Math.min(showingsPage * pageSize, showingsTotal)} of{' '}
                  {showingsTotal} showings
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowingsPage((p) => Math.max(1, p - 1))}
                    disabled={showingsPage === 1}
                    className={`px-4 py-2 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowingsPage((p) => p + 1)}
                    disabled={showingsPage * pageSize >= showingsTotal}
                    className={`px-4 py-2 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'chat' && (
          <div className={panel}>
            {!hasPhone && (
              <p className={muted}>Save your phone number (sidebar) to use chat — it ties activity to your account.</p>
            )}
            {hasPhone && (
              <>
                <label className={`mb-2 block text-sm font-medium ${heading}`}>Your question</label>
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  rows={4}
                  className={`mb-4 w-full rounded-xl border px-4 py-3 text-sm outline-none ring-blue-500/30 focus:ring-2 ${
                    isDark ? 'border-gray-700 bg-gray-950 text-white' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Ask about listings, policies, or anything in this agent’s knowledge base…"
                />
                <button
                  type="button"
                  disabled={chatMutation.isPending || !chatInput.trim()}
                  onClick={() => {
                    setChatReply(null)
                    chatMutation.mutate(chatInput.trim())
                  }}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:from-blue-500 hover:to-blue-600 disabled:opacity-50"
                >
                  {chatMutation.isPending ? 'Sending…' : 'Send'}
                </button>
                {chatReply && (
                  <div
                    className={`mt-6 rounded-xl border p-4 text-sm leading-relaxed ${
                      isDark ? 'border-gray-700 bg-gray-950/80 text-gray-200' : 'border-gray-200 bg-slate-50 text-gray-800'
                    }`}
                  >
                    {chatReply}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {selectedCallId && (
          <UserCallDetailsSheet
            agentId={agentId}
            callId={selectedCallId}
            isOpen
            onClose={() => setSelectedCallId(null)}
          />
        )}
        {selectedShowingId && (
          <UserShowingDetailsSheet
            agentId={agentId}
            showingId={selectedShowingId}
            isOpen
            onClose={() => setSelectedShowingId(null)}
          />
        )}
      </div>
    </PageTransition>
  )
}
