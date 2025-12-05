'use client'

import React, { useState } from 'react'
import { X, CheckCircle, Phone, Loader2, AlertCircle } from 'lucide-react'

interface ApproveVoiceAgentModalProps {
  requestId: string
  isOpen: boolean
  onClose: () => void
  onApprove: (phoneNumber: string) => void
  isPending: boolean
}

export default function ApproveVoiceAgentModal({
  requestId,
  isOpen,
  onClose,
  onApprove,
  isPending
}: ApproveVoiceAgentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const validatePhone = (value: string) => {
    const trimmed = value.trim()
    // Basic E.164 validation
    const e164Regex = /^\+[1-9]\d{1,14}$/
    return e164Regex.test(trimmed)
  }

  const handleApproveClick = () => {
    if (!phoneNumber.trim()) {
      setError('Phone number is required')
      return
    }
    if (!validatePhone(phoneNumber)) {
      setError('Invalid phone number format. Use E.164 (e.g., +14323093850)')
      return
    }
    setError('')
    onApprove(phoneNumber.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Approve Voice Agent</h2>
              <p className="text-gray-400 text-sm">Confirm approval and phone number assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Twilio Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  setError('')
                }}
                placeholder="+14323093850"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Use the Twilio phone number you already purchased and configured (E.164 format).
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Phone className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-white font-medium mb-1">What happens next?</p>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>This Twilio number will be linked to the agent as their voice agent number</li>
                  <li>A voice agent record will be created and activated</li>
                  <li>The agent will see this number in their dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApproveClick}
            disabled={isPending}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Approving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={20} />
                Approve
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

