// components/agent/BatchCallButton.tsx
'use client'

import { useState } from 'react'
import { Phone, PhoneCall, Users, Loader2, X, CheckCircle } from 'lucide-react'

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

  const count = contacts.length

  const handleOpenModal = () => {
    setSelectedIds(new Set(contacts.map(c => c.id)))
    setIsModalOpen(true)
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
    
    try {
      // TODO: Integrate with Twilio batch call API
      console.log('Initiating batch call for contacts:', Array.from(selectedIds))
      
      onBatchCallInitiated?.(Array.from(selectedIds))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to initiate batch call:', error)
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
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Selected contacts:</span>
                <span className="text-white font-bold text-lg">{selectedIds.size} / {count}</span>
              </div>
            </div>

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
