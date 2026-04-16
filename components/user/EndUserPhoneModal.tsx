'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@/contexts/ThemeContext'
import { updateEndUserPhone } from '@/lib/end_user/api'
import { Phone, X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  currentPhone: string | null | undefined
}

export default function EndUserPhoneModal({ open, onClose, currentPhone }: Props) {
  const { theme } = useTheme()
  const qc = useQueryClient()
  const [value, setValue] = useState('')

  useEffect(() => {
    if (open) setValue(currentPhone || '')
  }, [open, currentPhone])

  const mutation = useMutation({
    mutationFn: (phone: string) => updateEndUserPhone(phone),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['endUser', 'me'] })
      qc.invalidateQueries({ queryKey: ['endUser', 'calls'] })
      qc.invalidateQueries({ queryKey: ['endUser', 'showings'] })
      onClose()
    },
  })

  if (!open) return null

  const isDark = theme === 'dark'
  const panel =
    isDark
      ? 'border border-gray-700/90 bg-gradient-to-br from-gray-900 to-gray-950 text-white shadow-2xl shadow-black/40'
      : 'border border-gray-200 bg-white text-gray-900 shadow-xl shadow-gray-900/10'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-user-phone-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-xl ${panel}`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`rounded-lg p-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}
            >
              <Phone size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <h2 id="end-user-phone-title" className="text-lg font-bold tracking-tight">
              Your phone number
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-1 ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X size={20} />
          </button>
        </div>
        <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          We use this to show your calls and showings with each agent — the same number you use on the
          phone with them (any format is fine: E.164 or local).
        </p>
        <input
          type="tel"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`mb-4 w-full rounded-lg border px-3 py-2.5 text-sm ${
            theme === 'dark'
              ? 'border-gray-600 bg-gray-950 text-white'
              : 'border-gray-300 bg-white'
          }`}
          placeholder="+92 … or local number"
          autoComplete="tel"
        />
        {mutation.isError && (
          <p className="mb-3 text-sm text-red-500">
            {(mutation.error as Error)?.message || 'Could not save'}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending || !value.trim()}
            onClick={() => mutation.mutate(value.trim())}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-blue-500 hover:to-blue-600 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
