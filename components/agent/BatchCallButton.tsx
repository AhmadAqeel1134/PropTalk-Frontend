// components/agent/BatchCallButton.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Phone, PhoneCall, Users, Loader2, X, CheckCircle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { initiateBatchCalls } from '@/lib/real_estate_agent/api'
import { useTheme } from '@/contexts/ThemeContext'

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
  const { theme } = useTheme()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isInitiating, setIsInitiating] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [delaySeconds, setDelaySeconds] = useState(30) // Default 30 seconds, minimum 3 seconds
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ callCount: number; errors: any[] } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const count = contacts.length

  const handleOpenSheet = () => {
    setSelectedIds(new Set(contacts.map(c => c.id)))
    setIsSheetOpen(true)
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
      
      // Auto-close after 2 seconds if successful (user can also close manually anytime)
      setTimeout(() => {
        setIsSheetOpen(false)
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

  const sideSheetContent = (
    <>
      {/* Backdrop */}
      {isSheetOpen && (
        <div
          className={`fixed inset-0 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
            theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
          }`}
          onClick={() => setIsSheetOpen(false)}
        />
      )}

      {/* Side Sheet */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[600px] z-[100] shadow-2xl overflow-y-auto border-l transform transition-transform duration-300 ease-out ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        } ${
          isSheetOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ pointerEvents: isSheetOpen ? 'auto' : 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`sticky top-0 z-10 p-6 border-b backdrop-blur-sm ${
            theme === 'dark'
              ? 'border-gray-800 bg-gray-900/95'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-2xl font-bold mb-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Batch Call Campaign
              </h2>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Select contacts to include in the campaign
              </p>
            </div>
            <button
              onClick={() => setIsSheetOpen(false)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">

            {/* Selection Summary */}
            <div className={`rounded-lg p-4 mb-4 border ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700/50'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Selected contacts:</span>
                <span className={`font-bold text-lg ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{selectedIds.size} / {count}</span>
              </div>
              
              {/* Delay Input */}
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <label className={`block text-sm mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Delay between calls (seconds)
                </label>
                <input
                  type="number"
                  min="3"
                  max="300"
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Math.max(3, Math.min(300, parseInt(e.target.value) || 3)))}
                  disabled={isInitiating}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none disabled:opacity-50 ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                />
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
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
              <div className={`rounded-lg p-4 mb-4 border ${
                theme === 'dark'
                  ? 'bg-emerald-900/20 border-emerald-700/50'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-emerald-400 font-medium">
                      Batch call initiated successfully!
                    </p>
                    <p className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-emerald-300/80' : 'text-emerald-700'
                    }`}>
                      {success.callCount} call{success.callCount !== 1 ? 's' : ''} initiated
                      {success.errors.length > 0 && (
                        <span className={`block mt-1 ${
                          theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                        }`}>
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
              <div className={`rounded-lg p-4 mb-4 border ${
                theme === 'dark'
                  ? 'bg-red-900/20 border-red-700/50'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-400 font-medium">Failed to initiate batch call</p>
                    <p className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-red-300/80' : 'text-red-700'
                    }`}>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contacts List */}
            <div className="space-y-2 mb-6">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedIds.has(contact.id)
                      ? theme === 'dark'
                        ? 'bg-emerald-900/20 border-emerald-700/50'
                        : 'bg-emerald-50 border-emerald-200'
                      : theme === 'dark'
                      ? 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(contact.id)
                      ? 'bg-emerald-600 border-emerald-600'
                      : theme === 'dark'
                      ? 'border-gray-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedIds.has(contact.id) && (
                      <CheckCircle className="size-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={theme === 'dark' ? 'text-white font-medium' : 'text-gray-900 font-medium'}>
                      {contact.name}
                    </p>
                    <p className={theme === 'dark' ? 'text-gray-500 text-sm' : 'text-gray-600 text-sm'}>
                      {contact.phone_number}
                    </p>
                  </div>
                </button>
              ))}
            </div>
        </div>

        {/* Actions Footer */}
        <div className={`sticky bottom-0 p-6 border-t backdrop-blur-sm ${
          theme === 'dark'
            ? 'border-gray-800 bg-gray-900/95'
            : 'border-gray-200 bg-white'
        }`}>
          <div className="flex gap-4">
            <button
              onClick={() => setIsSheetOpen(false)}
              className={`flex-1 py-3 border rounded-lg font-medium transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
              }`}
            >
              {isInitiating ? 'Close' : 'Cancel'}
            </button>
            <button
              onClick={handleStartBatchCall}
              disabled={isInitiating || selectedIds.size === 0}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
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
    </>
  )

  return (
    <>
      <button
        disabled={disabled || count === 0}
        onClick={handleOpenSheet}
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20"
      >
        <Users className="size-5" />
        Batch Call ({count})
      </button>

      {mounted && typeof window !== 'undefined' && createPortal(sideSheetContent, document.body)}
    </>
  )
}
