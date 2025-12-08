// components/agent/ContactCard.tsx
import { Phone, Mail, Building, ChevronRight, Trash2, User } from 'lucide-react'

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
  onDelete?: (id: string) => void
}

export default function ContactCard({ contact, onViewDetails, onCall, onDelete }: ContactCardProps) {
  const initials = contact.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="group relative bg-gradient-to-br from-gray-900/90 to-gray-950/90 border-2 border-gray-800/50 rounded-2xl p-6 hover:border-gray-600 transition-all duration-500 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1">
      {/* Header with avatar */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 bg-gray-800/80 border-2 border-gray-700/50 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:border-gray-600 group-hover:scale-110 transition-all duration-300">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-gray-200 transition-colors truncate">{contact.name}</h3>
            {contact.properties_count > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <Building className="size-3.5 text-gray-500" />
                <span className="text-xs text-gray-400">{contact.properties_count} propert{contact.properties_count !== 1 ? 'ies' : 'y'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 p-3 bg-gray-800/40 border border-gray-700/30 rounded-lg group-hover:border-gray-600/50 transition-colors">
          <div className="p-1.5 bg-gray-700/50 rounded-lg">
            <Phone className="size-4 text-gray-400" />
          </div>
          <span className="text-sm font-medium text-white">{contact.phone_number}</span>
        </div>
        {contact.email && (
          <div className="flex items-center gap-3 p-3 bg-gray-800/40 border border-gray-700/30 rounded-lg group-hover:border-gray-600/50 transition-colors">
            <div className="p-1.5 bg-gray-700/50 rounded-lg">
              <Mail className="size-4 text-gray-400" />
            </div>
            <span className="text-sm text-gray-300 truncate">{contact.email}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onCall?.(contact.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-800/80 border-2 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Phone className="size-4" />
          Call
        </button>
        <button
          onClick={() => onViewDetails(contact.id)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300"
        >
          View
          <ChevronRight className="size-4" />
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(contact.id)}
            className="p-2.5 border-2 border-red-900/50 hover:border-red-700 rounded-xl transition-all duration-300 hover:bg-red-900/20"
            title="Delete contact"
          >
            <Trash2 className="size-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  )
}