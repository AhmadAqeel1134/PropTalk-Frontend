// End-user read-only showing sheet — layout aligned with agent ShowingDetailsSheet.
'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserShowingForAgent } from '@/lib/end_user/api'
import { useTheme } from '@/contexts/ThemeContext'
import {
  X,
  CalendarCheck,
  MapPin,
  Clock,
  User,
  Phone,
  Home,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Building2,
  DollarSign,
  BedDouble,
  Bath,
  Ruler,
  PhoneOutgoing,
  PhoneIncoming,
  Globe,
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { Showing } from '@/types/agent.types'

interface Props {
  agentId: string
  showingId: string
  isOpen: boolean
  onClose: () => void
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const STATUS_META: Record<
  string,
  { label: string; badgeCls: string; darkBadge: string; icon: typeof CheckCircle }
> = {
  requested: {
    label: 'Requested',
    badgeCls: 'bg-amber-100 text-amber-800 border border-amber-200',
    darkBadge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    icon: AlertCircle,
  },
  confirmed: {
    label: 'Confirmed',
    badgeCls: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    darkBadge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    icon: CheckCircle,
  },
  completed: {
    label: 'Completed',
    badgeCls: 'bg-blue-100 text-blue-800 border border-blue-200',
    darkBadge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    badgeCls: 'bg-red-100 text-red-800 border border-red-200',
    darkBadge: 'bg-red-500/20 text-red-300 border border-red-500/30',
    icon: XCircle,
  },
  no_show: {
    label: 'No Show',
    badgeCls: 'bg-gray-100 text-gray-800 border border-gray-200',
    darkBadge: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
    icon: XCircle,
  },
}

const SOURCE_LABEL: Record<string, { label: string; icon: typeof Globe }> = {
  voice_inbound: { label: 'Voice – Inbound', icon: PhoneIncoming },
  voice_outbound: { label: 'Voice – Outbound', icon: PhoneOutgoing },
  manual: { label: 'Manual', icon: CalendarCheck },
  web: { label: 'Web Booking', icon: Globe },
}

export default function UserShowingDetailsSheet({ agentId, showingId, isOpen, onClose }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [slideIn, setSlideIn] = useState(false)

  const { data: showing, isLoading } = useQuery<Showing>({
    queryKey: ['endUser', 'showing', agentId, showingId],
    queryFn: () => getUserShowingForAgent(agentId, showingId) as Promise<Showing>,
    enabled: isOpen && !!agentId && !!showingId,
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => setSlideIn(true))
    }
    return () => {
      document.body.style.overflow = ''
      setSlideIn(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setSlideIn(false)
    setTimeout(onClose, 300)
  }

  if (!isOpen) return null

  const meta = STATUS_META[showing?.status ?? 'requested'] ?? STATUS_META.requested
  const StatusIcon = meta.icon
  const sourceMeta = SOURCE_LABEL[showing?.source ?? 'manual'] ?? SOURCE_LABEL.manual
  const SourceIcon = sourceMeta.icon

  const hasProperty = !!(showing?.property_address || showing?.property_id)
  const hasPropertyDetails = !!(
    showing?.property_type ||
    showing?.property_price != null ||
    showing?.property_bedrooms != null
  )

  return (
    <>
      <div
        className={`fixed inset-0 z-[55] transition-opacity duration-300 ${
          slideIn ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed inset-y-0 right-0 z-[60] flex w-full max-w-full flex-col shadow-2xl transition-transform duration-300 ease-out
          h-[100dvh] max-h-[100dvh]
          ${slideIn ? 'translate-x-0' : 'translate-x-full'}
          ${isDark ? 'bg-gray-900 border-l border-white/10' : 'bg-white border-l border-gray-200'}`}
      >
        <div
          className={`flex shrink-0 items-center justify-between px-6 py-4 border-b ${
            isDark ? 'bg-gray-900/95 backdrop-blur border-white/10' : 'bg-white/95 backdrop-blur border-gray-200'
          }`}
        >
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <CalendarCheck size={20} className="text-purple-400" />
            Showing Details
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {isLoading || !showing ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
            <div
              className={`rounded-xl p-4 flex items-center justify-between ${
                isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-gray-50 border border-gray-100'
              }`}
            >
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
                  isDark ? meta.darkBadge : meta.badgeCls
                }`}
              >
                <StatusIcon size={12} />
                {meta.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <SourceIcon size={14} />
                {sourceMeta.label}
              </span>
            </div>

            <SectionCard isDark={isDark} title="Schedule">
              <DetailRow icon={<Clock size={16} className="text-blue-400" />} label="Date" isDark={isDark}>
                {fmtDate(showing.scheduled_start)}
              </DetailRow>
              <DetailRow icon={<Clock size={16} className="text-blue-400" />} label="Time" isDark={isDark}>
                {fmtTime(showing.scheduled_start)}
                {showing.scheduled_end && (
                  <span className={`ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    – {fmtTime(showing.scheduled_end)}
                  </span>
                )}
              </DetailRow>
              <DetailRow icon={<MapPin size={16} className="text-orange-400" />} label="Visit Type" isDark={isDark}>
                <span className="capitalize">{(showing.visit_type || 'property_visit').replace('_', ' ')}</span>
              </DetailRow>
            </SectionCard>

            <SectionCard isDark={isDark} title="Property">
              {hasProperty ? (
                <>
                  <DetailRow icon={<Home size={16} className="text-purple-400" />} label="Address" isDark={isDark}>
                    <span className="font-medium">{showing.property_address || 'Not specified'}</span>
                    {(showing.property_city || showing.property_state) && (
                      <span className={`block text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {[showing.property_city, showing.property_state].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </DetailRow>

                  {hasPropertyDetails && (
                    <div
                      className={`grid grid-cols-2 gap-3 mt-3 pt-3 border-t ${
                        isDark ? 'border-white/[0.06]' : 'border-gray-100'
                      }`}
                    >
                      {showing.property_type && (
                        <MiniStat
                          icon={<Building2 size={14} />}
                          label="Type"
                          value={showing.property_type}
                          isDark={isDark}
                        />
                      )}
                      {showing.property_price != null && (
                        <MiniStat
                          icon={<DollarSign size={14} />}
                          label="Price"
                          value={fmtCurrency(showing.property_price)}
                          isDark={isDark}
                        />
                      )}
                      {showing.property_bedrooms != null && (
                        <MiniStat
                          icon={<BedDouble size={14} />}
                          label="Beds"
                          value={String(showing.property_bedrooms)}
                          isDark={isDark}
                        />
                      )}
                      {showing.property_bathrooms != null && (
                        <MiniStat
                          icon={<Bath size={14} />}
                          label="Baths"
                          value={String(showing.property_bathrooms)}
                          isDark={isDark}
                        />
                      )}
                      {showing.property_sqft != null && (
                        <MiniStat
                          icon={<Ruler size={14} />}
                          label="Sqft"
                          value={showing.property_sqft.toLocaleString()}
                          isDark={isDark}
                        />
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No property linked to this showing
                </p>
              )}
            </SectionCard>

            <SectionCard isDark={isDark} title="Contact">
              <DetailRow icon={<User size={16} className="text-emerald-400" />} label="Name" isDark={isDark}>
                {showing.contact_name || showing.caller_name || 'Unknown'}
              </DetailRow>
              {(showing.contact_phone || showing.caller_phone) && (
                <DetailRow icon={<Phone size={16} className="text-indigo-400" />} label="Phone" isDark={isDark}>
                  {showing.contact_phone || showing.caller_phone}
                </DetailRow>
              )}
              {showing.contact_email && (
                <DetailRow icon={<Mail size={16} className="text-sky-400" />} label="Email" isDark={isDark}>
                  {showing.contact_email}
                </DetailRow>
              )}
            </SectionCard>

            {showing.notes && (
              <SectionCard isDark={isDark} title="Notes">
                <div className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FileText size={14} className="inline mr-2 text-pink-400" />
                  {showing.notes}
                </div>
              </SectionCard>
            )}

            <div className={`text-xs space-y-1 pt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              <p>
                Created: {fmtDate(showing.created_at)} {fmtTime(showing.created_at)}
              </p>
              {showing.twilio_call_sid && (
                <p>
                  Call SID: <span className="font-mono">{showing.twilio_call_sid}</span>
                </p>
              )}
              <p className="font-mono text-[10px] opacity-60">ID: {showing.id}</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function SectionCard({
  isDark,
  title,
  children,
}: {
  isDark: boolean
  title: string
  children: ReactNode
}) {
  return (
    <div
      className={`rounded-xl p-4 space-y-3 ${
        isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50/80 border border-gray-100'
      }`}
    >
      <h3
        className={`text-xs font-bold uppercase tracking-wider mb-2 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

function DetailRow({
  icon,
  label,
  isDark,
  children,
}: {
  icon: ReactNode
  label: string
  isDark: boolean
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${isDark ? 'bg-white/[0.05]' : 'bg-white'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-medium mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{children}</div>
      </div>
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value,
  isDark,
}: {
  icon: ReactNode
  label: string
  value: string
  isDark: boolean
}) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-white'}`}>
      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{icon}</span>
      <div>
        <p
          className={`text-[10px] uppercase tracking-wider font-medium ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          {label}
        </p>
        <p className={`text-xs font-semibold capitalize ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{value}</p>
      </div>
    </div>
  )
}
