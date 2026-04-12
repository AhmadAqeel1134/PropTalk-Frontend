'use client'

import { useState, useEffect } from 'react'
import {
  CalendarCheck,
  Plus,
  X,
  MapPin,
  Clock,
  User,
  Home,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import ShowingDetailsSheet from './ShowingDetailsSheet'
import CreateShowingModal from './CreateShowingModal'
import { useShowings, useUpdateShowing } from '@/hooks/useAgent'
import { useTheme } from '@/contexts/ThemeContext'
import type { Showing } from '@/types/agent.types'

const STATUS_CONFIG: Record<string, { label: string; color: string; darkColor: string; icon: typeof CheckCircle }> = {
  requested: { label: 'Requested', color: 'bg-amber-100 text-amber-800 border-amber-200', darkColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: AlertCircle },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', darkColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 border-blue-200', darkColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', darkColor: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle },
  no_show: { label: 'No Show', color: 'bg-gray-100 text-gray-800 border-gray-200', darkColor: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: XCircle },
}

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  ...Object.keys(STATUS_CONFIG).map((s) => ({ value: s, label: STATUS_CONFIG[s].label })),
]

function StatusBadge({ status, theme }: { status: string; theme: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.requested
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${theme === 'dark' ? cfg.darkColor : cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const btnPrimaryOutline = (dark: boolean) =>
  dark
    ? 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800'
    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-sm'

export default function ShowingsList() {
  const { theme } = useTheme()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const updateMutation = useUpdateShowing()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data, isLoading, error } = useShowings({
    page,
    page_size: 20,
    status: statusFilter || undefined,
  })

  const showings = data?.items ?? []
  const total = data?.total ?? 0

  const hasActiveFilters = statusFilter !== ''

  const handleStatusChange = async (showing: Showing, newStatus: string) => {
    try {
      await updateMutation.mutateAsync({ id: showing.id, data: { status: newStatus } })
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const clearFilters = () => {
    setStatusFilter('')
    setPage(1)
  }

  if (error) return <ErrorMessage message={(error as Error).message} />

  const isDark = theme === 'dark'

  return (
    <PageTransition>
      <div
        className="min-h-screen p-6 md:p-8"
        style={isDark ? { background: 'rgba(10, 15, 25, 0.95)' } : { background: 'rgba(248, 250, 252, 0.98)' }}
      >
        <div className="max-w-full">
          {/* Header — matches Documents / Call History */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div
              className={`rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl ${
                isDark
                  ? 'bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50'
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-xl border ${
                        isDark ? 'bg-gray-800/60 border-gray-700/50' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <CalendarCheck size={24} className={isDark ? 'text-gray-300' : 'text-blue-600'} />
                    </div>
                    <div>
                      <h1
                        className={`text-3xl md:text-4xl font-bold mb-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Showings
                      </h1>
                      <p
                        className={`text-sm md:text-base ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {total} showing{total !== 1 ? 's' : ''} scheduled • Visits from voice and manual bookings
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className={`flex items-center gap-2 border px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${btnPrimaryOutline(isDark)}`}
                >
                  <Plus size={18} />
                  New Showing
                </button>
              </div>
            </div>
          </div>

          {/* Filters — matches Call History filter card */}
          <div
            className={`mb-8 rounded-2xl p-6 backdrop-blur-sm shadow-xl transition-all duration-500 ease-out ${
              isDark ? 'bg-gray-900/60 border border-gray-800/50' : 'bg-white border border-gray-200 shadow-sm'
            } ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex-1">
                <label
                  className={`block text-xs mb-2 font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_FILTER_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value || 'all'}
                      type="button"
                      onClick={() => {
                        setStatusFilter(value)
                        setPage(1)
                      }}
                      className={`px-4 py-2 rounded-xl font-medium transition-all border ${
                        statusFilter === value
                          ? isDark
                            ? 'bg-gray-800 border-2 border-gray-600 text-white'
                            : 'bg-blue-50 border-2 border-blue-200 text-blue-700 shadow-sm'
                          : isDark
                            ? 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'
                            : 'bg-white border border-gray-300 text-gray-600 hover:text-blue-700 hover:border-blue-400 shadow-sm'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`px-4 py-3 border rounded-xl font-medium transition-all flex items-center gap-2 self-start sm:self-auto ${
                    isDark
                      ? 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-blue-400 shadow-sm'
                  }`}
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* List / empty / loading */}
          {isLoading ? (
            <LoadingSpinner />
          ) : showings.length === 0 ? (
            <div
              className={`text-center py-20 border-2 rounded-2xl backdrop-blur-sm ${
                isDark
                  ? 'bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-gray-800/50'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <CalendarCheck
                className={`size-20 mx-auto mb-6 ${isDark ? 'text-gray-700' : 'text-gray-400'}`}
              />
              <h3
                className={`text-xl font-medium mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                No showings yet
              </h3>
              <p
                className={`mb-8 max-w-md mx-auto ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                {hasActiveFilters
                  ? 'Try adjusting your status filter'
                  : 'Showings booked via voice calls or scheduled manually will appear here'}
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className={`inline-flex items-center gap-2 border px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${btnPrimaryOutline(isDark)}`}
              >
                <Plus size={18} />
                Schedule a Showing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {showings.map((s, index) => (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedId(s.id)
                    setIsSheetOpen(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedId(s.id)
                      setIsSheetOpen(true)
                    }
                  }}
                  className={`group relative border-2 rounded-2xl p-6 backdrop-blur-sm shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isDark
                      ? 'bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-gray-800/50 hover:border-gray-700'
                      : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
                  } ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${Math.min(index * 50, 500)}ms` }}
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
                          <h3
                            className={`text-lg font-bold truncate ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {s.property_address || 'Property TBD'}
                          </h3>
                          <StatusBadge status={s.status} theme={theme} />
                        </div>
                        <div
                          className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} /> {formatTime(s.scheduled_start)}
                          </span>
                          {s.contact_name && (
                            <span className="flex items-center gap-1.5">
                              <User size={14} /> {s.contact_name}
                            </span>
                          )}
                          {s.property_city && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} /> {s.property_city}
                            </span>
                          )}
                          {s.visit_type && (
                            <span className="flex items-center gap-1.5">
                              <Home size={14} /> {s.visit_type.replace('_', ' ')}
                            </span>
                          )}
                          {s.source?.startsWith('voice') && (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                s.source === 'voice_outbound'
                                  ? isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-50 text-purple-600'
                                  : isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'
                              }`}
                            >
                              {s.source === 'voice_outbound' ? 'Outbound' : 'Inbound'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {s.status === 'requested' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s, 'confirmed')}
                            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                              isDark
                                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s, 'cancelled')}
                            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                              isDark
                                ? 'border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20'
                                : 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
                            }`}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {s.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s, 'completed')}
                          className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                            isDark
                              ? 'border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                              : 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          Mark Done
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(s.id)
                          setIsSheetOpen(true)
                        }}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isDark
                            ? 'border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination — matches Call History */}
          {!isLoading && total > 20 && (
            <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} showings
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btnPrimaryOutline(isDark)}`}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 20 >= total}
                  className={`px-4 py-2 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btnPrimaryOutline(isDark)}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedId && (
          <ShowingDetailsSheet
            showingId={selectedId}
            isOpen={isSheetOpen}
            onClose={() => {
              setIsSheetOpen(false)
              setSelectedId(null)
            }}
          />
        )}

        {showCreateModal && <CreateShowingModal onClose={() => setShowCreateModal(false)} />}
      </div>
    </PageTransition>
  )
}
