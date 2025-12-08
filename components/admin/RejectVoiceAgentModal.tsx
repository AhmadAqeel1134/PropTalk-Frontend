'use client'

import React, { useState } from 'react'
import { X, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface RejectVoiceAgentModalProps {
  requestId: string
  isOpen: boolean
  onClose: () => void
  onReject: (reason: string) => void
  isPending: boolean
}

export default function RejectVoiceAgentModal({
  requestId,
  isOpen,
  onClose,
  onReject,
  isPending
}: RejectVoiceAgentModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleReject = () => {
    if (!reason.trim()) {
      setError('Rejection reason is required')
      return
    }
    if (reason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters')
      return
    }
    setError('')
    onReject(reason.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <XCircle className="text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Reject Voice Agent</h2>
              <p className="text-gray-400 text-sm">Provide a reason for rejection</p>
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
              Rejection Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError('')
              }}
              rows={4}
              className={`w-full px-4 py-3 bg-gray-800 border ${
                error ? 'border-red-500' : 'border-gray-700'
              } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none`}
              placeholder="Please provide a clear reason for rejecting this request (minimum 10 characters)..."
            />
            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              {reason.length}/10 characters minimum
            </p>
          </div>

          <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-gray-300">
                The agent will receive this rejection reason. Please be clear and constructive.
              </p>
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
            onClick={handleReject}
            disabled={isPending || !reason.trim() || reason.trim().length < 10}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Rejecting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <XCircle size={20} />
                Reject Request
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

