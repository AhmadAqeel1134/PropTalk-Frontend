'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, CalendarCheck, Loader2, MapPin, Clock, FileText } from 'lucide-react'
import { useCreateShowing, useMyContacts, useMyProperties } from '@/hooks/useAgent'
import { useTheme } from '@/contexts/ThemeContext'

interface Props {
  onClose: () => void
}

export default function CreateShowingModal({ onClose }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const createMutation = useCreateShowing()
  const { data: contacts = [] } = useMyContacts()
  const { data: propertiesData } = useMyProperties()
  const properties = propertiesData?.items ?? propertiesData ?? []

  const [form, setForm] = useState({
    property_id: '',
    contact_id: '',
    caller_name: '',
    visit_type: 'property_visit',
    scheduled_date: '',
    scheduled_time: '',
    notes: '',
  })
  const [error, setError] = useState('')
  /** Drives enter/exit transitions before parent unmounts */
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isClosingRef = useRef(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    setOpen(false)
    closeTimerRef.current = setTimeout(() => {
      onClose()
      closeTimerRef.current = null
    }, 280)
  }, [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.scheduled_date || !form.scheduled_time) {
      setError('Date and time are required.')
      return
    }

    const scheduled_start = new Date(`${form.scheduled_date}T${form.scheduled_time}`).toISOString()

    try {
      await createMutation.mutateAsync({
        property_id: form.property_id || undefined,
        contact_id: form.contact_id || undefined,
        caller_name: !form.contact_id ? form.caller_name || undefined : undefined,
        visit_type: form.visit_type,
        scheduled_start,
        source: 'manual',
        notes: form.notes || undefined,
      })
      handleClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create showing.'
      setError(msg)
    }
  }

  const inputClass = `w-full px-4 py-3 border rounded-lg text-sm transition-colors outline-none focus:ring-2 focus:ring-offset-0 ${
    isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
  }`

  /** Native selects: color-scheme hints the OS popup; pairs with globals.css `option` rules */
  const selectClass = `${inputClass} ${isDark ? '[color-scheme:dark]' : '[color-scheme:light]'}`

  const optionClass = isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`

  const sectionTitle = (icon: React.ReactNode, title: string) => (
    <h3
      className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}
    >
      {icon}
      {title}
    </h3>
  )

  const overlayTint = isDark ? 'bg-black/50' : 'bg-black/30'

  return (
    <div
      className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4 transition-opacity duration-300 ease-out ${overlayTint} ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className={`border rounded-xl shadow-2xl w-full max-w-3xl my-8 will-change-transform transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } ${open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-[0.97] opacity-0'}`}
        style={{ colorScheme: isDark ? 'dark' : 'light' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — match CreatePropertyForm */}
        <div
          className={`flex items-start justify-between gap-4 px-6 md:px-8 pt-8 pb-6 border-b ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          }`}
        >
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Schedule Showing
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Book a property visit and keep your pipeline organized
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={`p-2 rounded-lg shrink-0 transition-all ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 md:px-8 py-6 space-y-8 max-h-[min(70vh,calc(100vh-8rem))] overflow-y-auto">
          {error && (
            <div
              className={`p-4 rounded-lg text-sm border ${
                isDark ? 'bg-red-900/30 border-red-800/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {error}
            </div>
          )}

          {/* Property & guest — two columns on md+ */}
          <div>
            {sectionTitle(
              <MapPin className="size-4 shrink-0" />,
              'Property & guest'
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className={labelClass}>Property</label>
                <select
                  value={form.property_id}
                  onChange={(e) => setForm((f) => ({ ...f, property_id: e.target.value }))}
                  className={selectClass}
                >
                  <option value="" className={optionClass}>
                    Select a property (optional)
                  </option>
                  {(Array.isArray(properties) ? properties : []).map((p: { id: string; address?: string; city?: string }) => (
                    <option key={p.id} value={p.id} className={optionClass}>
                      {p.address}
                      {p.city ? `, ${p.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Contact</label>
                <select
                  value={form.contact_id}
                  onChange={(e) => setForm((f) => ({ ...f, contact_id: e.target.value }))}
                  className={selectClass}
                >
                  <option value="" className={optionClass}>
                    Select a contact (optional)
                  </option>
                  {contacts.map((c: { id: string; name: string; phone_number: string }) => (
                    <option key={c.id} value={c.id} className={optionClass}>
                      {c.name} — {c.phone_number}
                    </option>
                  ))}
                </select>
              </div>
              {!form.contact_id ? (
                <div className="md:col-span-2">
                  <label className={labelClass}>Visitor name (if no contact)</label>
                  <input
                    type="text"
                    placeholder="Name for the visit"
                    value={form.caller_name}
                    onChange={(e) => setForm((f) => ({ ...f, caller_name: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Visit type & schedule */}
          <div>
            {sectionTitle(
              <Clock className="size-4 shrink-0" />,
              'Visit & time'
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className={form.contact_id ? '' : 'md:col-span-2'}>
                <label className={labelClass}>Visit type</label>
                <select
                  value={form.visit_type}
                  onChange={(e) => setForm((f) => ({ ...f, visit_type: e.target.value }))}
                  className={selectClass}
                >
                  <option value="property_visit" className={optionClass}>
                    Property Visit
                  </option>
                  <option value="office_visit" className={optionClass}>
                    Office Visit
                  </option>
                  <option value="custom_meeting" className={optionClass}>
                    Custom Meeting
                  </option>
                  <option value="showing" className={optionClass}>
                    Showing
                  </option>
                  <option value="consultation" className={optionClass}>
                    Consultation
                  </option>
                  <option value="inspection" className={optionClass}>
                    Inspection
                  </option>
                  <option value="open_house" className={optionClass}>
                    Open House
                  </option>
                </select>
              </div>
              {form.contact_id ? (
                <div className={`hidden md:flex items-end pb-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Guest details will use the selected contact.
                </div>
              ) : null}
              <div>
                <label className={labelClass}>
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.scheduled_time}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_time: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes — full width */}
          <div>
            {sectionTitle(
              <FileText className="size-4 shrink-0" />,
              'Notes'
            )}
            <label className={labelClass}>Instructions (optional)</label>
            <textarea
              rows={4}
              placeholder="Parking, gate code, special instructions…"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className={`${inputClass} resize-y min-h-[100px]`}
            />
          </div>

          {/* Actions — match CreatePropertyForm */}
          <div
            className={`flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 py-3.5 px-4 border rounded-xl font-semibold transition-all ${
                isDark
                  ? 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800/80'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Scheduling…
                </>
              ) : (
                <>
                  <CalendarCheck className="size-5" />
                  Schedule showing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
