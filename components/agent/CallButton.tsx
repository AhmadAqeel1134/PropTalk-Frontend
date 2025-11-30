// components/common/CallButton.tsx
import { Phone } from 'lucide-react'

interface CallButtonProps {
  contactId: string
  contactName: string
  phoneNumber: string
  disabled?: boolean
  onCallInitiated?: () => void
}

export default function CallButton({ contactName, phoneNumber, disabled, onCallInitiated }: CallButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onCallInitiated}
      className="flex items-center gap-3 bg-gray-800 border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all"
    >
      <Phone className="size-5" />
      Call {contactName}
    </button>
  )
}