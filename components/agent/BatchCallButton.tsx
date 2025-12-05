// components/agent/BatchCallButton.tsx
'use client'

import { useState } from 'react'
import { Phone, PhoneCall, Users, Loader2, X, CheckCircle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { initiateBatchCalls } from '@/lib/real_estate_agent/api'

interface Contact {
  id: string
  name: string
  phone_number: string
}

interface BatchCallButtonProps {
  contacts: Contact[]
  disabled?: boolean
  onBatchCallInitiated?: (contactIds: string[]) => void
}

export default function BatchCallButton({ 
  contacts, 
  disabled = false, 
  onBatchCallInitiated 
}: BatchCallButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInitiating, setIsInitiating] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [delaySeconds, setDelaySeconds] = useState(30) // Default 30 seconds, minimum 3 seconds
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ callCount: number; errors: any[] } | null>(null)

  const count = contacts.length

  const handleOpenModal = () => {
    setSelectedIds(new Set(contacts.map(c => c.id)))
    setIsModalOpen(true)
    setError(null)
    setSuccess(null)
  }

  const toggleContact = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleStartBatchCall = async () => {
    if (selectedIds.size === 0) return
    
    setIsInitiating(true)
    setError(null)
    setSuccess(null)
    
    try {
      const contactIdsArray = Array.from(selectedIds)
      console.log('📞 Initiating batch call for contacts:', contactIdsArray)
      console.log('⏱️ Delay between calls:', delaySeconds, 'seconds')
      
      const result = await initiateBatchCalls({
        contact_ids: contactIdsArray,
        delay_seconds: delaySeconds
      })
      
      console.log('✅ Batch call initiated successfully:', result)
      
      setSuccess({
        callCount: result.call_count || 0,
        errors: result.errors || []
      })
      
      onBatchCallInitiated?.(contactIdsArray)
      
      // Close modal after 2 seconds if successful
      setTimeout(() => {
        setIsModalOpen(false)
        setSuccess(null)
      }, 2000)
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to initiate batch call'
      console.error('❌ Failed to initiate batch call:', error)
      setError(errorMessage)
    } finally {
      setIsInitiating(false)
    }
  }

  return (
    <>
      <button
        disabled={disabled || count === 0}
        onClick={handleOpenModal}
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20"
      >
        <Users className="size-5" />
        Batch Call ({count})
      </button>

      {/* Batch Call Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isInitiating) setIsModalOpen(false)
          }}
        >
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Start Batch Call</h2>
                <p className="text-gray-400 text-sm mt-1">Select contacts to include in the campaign</p>
              </div>
              <button 
                onClick={() => !isInitiating && setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                disabled={isInitiating}
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Selection Summary */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400">Selected contacts:</span>
                <span className="text-white font-bold text-lg">{selectedIds.size} / {count}</span>
              </div>
              
              {/* Delay Input */}
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <label className="block text-sm text-gray-400 mb-2">
                  Delay between calls (seconds)
                </label>
                <input
                  type="number"
                  min="3"
                  max="300"
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Math.max(3, Math.min(300, parseInt(e.target.value) || 3)))}
                  disabled={isInitiating}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-600 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Calls will be made with {delaySeconds} second{delaySeconds !== 1 ? 's' : ''} delay between each
                </p>
                {delaySeconds < 3 && (
                  <p className="text-xs text-amber-400 mt-1">
                    ⚠️ Minimum 3 seconds recommended to prevent webhook conflicts
                  </p>
                )}
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-emerald-400 font-medium">
                      Batch call initiated successfully!
                    </p>
                    <p className="text-emerald-300/80 text-sm mt-1">
                      {success.callCount} call{success.callCount !== 1 ? 's' : ''} initiated
                      {success.errors.length > 0 && (
                        <span className="block mt-1 text-amber-400">
                          {success.errors.length} error{success.errors.length !== 1 ? 's' : ''} occurred
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-400 font-medium">Failed to initiate batch call</p>
                    <p className="text-red-300/80 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-2">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    selectedIds.has(contact.id)
                      ? 'bg-emerald-900/20 border-emerald-700/50'
                      : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(contact.id)
                      ? 'bg-emerald-600 border-emerald-600'
                      : 'border-gray-600'
                  }`}>
                    {selectedIds.has(contact.id) && (
                      <CheckCircle className="size-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{contact.name}</p>
                    <p className="text-gray-500 text-sm">{contact.phone_number}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-800">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isInitiating}
                className="flex-1 py-3 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartBatchCall}
                disabled={isInitiating || selectedIds.size === 0}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isInitiating ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <PhoneCall className="size-5" />
                    Start Calling ({selectedIds.size})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
