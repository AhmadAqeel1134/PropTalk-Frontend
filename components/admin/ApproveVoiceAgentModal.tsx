'use client'

import React from 'react'
import { X, CheckCircle, Phone, Loader2 } from 'lucide-react'

interface ApproveVoiceAgentModalProps {
  requestId: string
  isOpen: boolean
  onClose: () => void
  onApprove: () => void
  isPending: boolean
}

export default function ApproveVoiceAgentModal({
  requestId,
  isOpen,
  onClose,
  onApprove,
  isPending
}: ApproveVoiceAgentModalProps) {
  if (!isOpen) return null

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
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Phone className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-white font-medium mb-1">What happens next?</p>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>A Twilio phone number will be automatically assigned</li>
                  <li>The voice agent will be created and activated</li>
                  <li>The agent will receive notification of approval</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-sm">
            Are you sure you want to approve this voice agent request? This action cannot be undone.
          </p>
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
            onClick={onApprove}
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

