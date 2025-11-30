// components/agent/ContactCard.tsx
import { Phone, Mail, Building, ChevronRight } from 'lucide-react'

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
}

export default function ContactCard({ contact, onViewDetails, onCall }: ContactCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{contact.name}</h3>
        {contact.properties_count > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full">
            <Building className="size-3" />
            {contact.properties_count}
          </span>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <Phone className="size-5 text-gray-500" />
          <span className="text-gray-300">{contact.phone_number}</span>
        </div>
        {contact.email && (
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-gray-500" />
            <span className="text-gray-400 text-sm">{contact.email}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onCall?.(contact.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white py-2 rounded-lg transition-all"
        >
          <Phone className="size-4" />
          Call
        </button>
        <button
          onClick={() => onViewDetails(contact.id)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-all"
        >
          View
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}