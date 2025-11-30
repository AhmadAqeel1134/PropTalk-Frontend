// components/common/BatchCallButton.tsx
import { Phone } from 'lucide-react'

interface BatchCallButtonProps {
  selectedContactIds: string[]
  disabled?: boolean
  onBatchCallInitiated?: () => void
}

export default function BatchCallButton({ selectedContactIds, disabled, onBatchCallInitiated }: BatchCallButtonProps) {
  {
  const count = selectedContactIds.length

  return (
    <button
      disabled={disabled || count === 0}
      onClick={onBatchCallInitiated}
      className="flex items-center gap-2 px-5 py-3 bg-gray-800 border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white rounded-lg transition-all"
    >
      <Phone className="size-5" />
      Call Selected ({count})
    </button>
  )
}