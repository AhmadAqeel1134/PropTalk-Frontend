// components/agent/ContactCard.tsx
'use client'

import { Phone, Mail, Building, ChevronRight, Trash2, User, Loader2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface ContactCardProps {
  contact: {
    id: string
    name: string
    phone_number: string
    email: string | null
    properties_count: number
  }
  onViewDetails: (id: string) => void
  onCall?: (id: string) => void
  callingId?: string | null
  onDelete?: (id: string) => void
}

export default function ContactCard({ contact, onViewDetails, onCall, onDelete, callingId }: ContactCardProps) {
  const { theme } = useTheme()
  const initials = contact.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`group relative border-2 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900/90 to-gray-950/90 border-gray-800/50 hover:border-gray-600 hover:shadow-2xl hover:shadow-black/40'
          : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl shadow-sm'
      }`}
    >
      {/* Header with avatar */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div
              className={`w-14 h-14 border-2 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/80 border-gray-700/50 group-hover:border-gray-600 text-white'
                  : 'bg-gray-100 border-gray-200 group-hover:border-blue-400 text-gray-900'
              }`}
            >
              {initials}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 ${
                theme === 'dark' ? 'border-gray-900' : 'border-white'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-bold mb-1 transition-colors truncate ${
                theme === 'dark'
                  ? 'text-white group-hover:text-gray-200'
                  : 'text-gray-900 group-hover:text-blue-700'
              }`}
            >
              {contact.name}
            </h3>
            {contact.properties_count > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <Building className={`size-3.5 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`} />
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {contact.properties_count} propert{contact.properties_count !== 1 ? 'ies' : 'y'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-3 mb-6">
        <div
          className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
            theme === 'dark'
              ? 'bg-gray-800/40 border-gray-700/30 group-hover:border-gray-600/50'
              : 'bg-gray-50 border-gray-200 group-hover:border-blue-300'
          }`}
        >
          <div
            className={`p-1.5 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200'
            }`}
          >
            <Phone className={`size-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {contact.phone_number}
          </span>
        </div>
        {contact.email && (
          <div
            className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800/40 border-gray-700/30 group-hover:border-gray-600/50'
                : 'bg-gray-50 border-gray-200 group-hover:border-blue-300'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200'
              }`}
            >
              <Mail className={`size-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
            <span className={`text-sm truncate ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {contact.email}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onCall?.(contact.id)}
          disabled={contact.id === (callingId as any)}
          className={`flex-1 flex items-center justify-center gap-2 border-2 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed ${
            theme === 'dark'
              ? 'bg-gray-800/80 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl'
              : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 shadow-sm hover:shadow-md'
          }`}
        >
          {contact.id === (callingId as any) ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Phone className="size-4" />
          )}
          {contact.id === (callingId as any) ? 'Calling...' : 'Call'}
        </button>
        <button
          onClick={() => onViewDetails(contact.id)}
          className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl font-semibold transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white'
              : 'bg-white border-gray-200 hover:border-blue-400 text-gray-600 hover:text-blue-700 shadow-sm'
          }`}
        >
          View
          <ChevronRight className="size-4" />
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(contact.id)}
            className={`p-2.5 border-2 rounded-xl transition-all duration-300 ${
              theme === 'dark'
                ? 'border-red-900/50 hover:border-red-700 hover:bg-red-900/20'
                : 'border-red-200 hover:border-red-300 hover:bg-red-50'
            }`}
            title="Delete contact"
          >
            <Trash2 className={`size-4 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`} />
          </button>
        )}
      </div>
    </div>
  )
}