// components/agent/EditContactForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, User, Phone, Mail, FileText, Save, Loader2 } from 'lucide-react'
import { useUpdateContact } from '@/hooks/useAgent'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  phone_number: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes are too long').optional(),
})

type FormData = z.infer<typeof schema>

interface EditContactFormProps {
  contact: { 
    id: string
    name: string
    phone_number: string
    email: string | null
    notes: string | null 
  }
  onClose: () => void 
}

export default function EditContactForm({ contact, onClose }: EditContactFormProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: contact.name,
      phone_number: contact.phone_number,
      email: contact.email || '',
      notes: contact.notes || '',
    }
  })

  const mutation = useUpdateContact()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onSubmit = (data: FormData) => {
    const cleanData = {
      ...data,
      email: data.email || undefined,
      notes: data.notes || undefined,
    }

    mutation.mutate({ id: contact.id, data: cleanData }, {
      onSuccess: () => onClose()
    })
  }

  const inputClass = (hasError: boolean) => `w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
    hasError ? 'border-red-600 focus:border-red-500' : 'border-gray-700 focus:border-gray-500'
  }`

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl"
        style={{ animation: isMounted ? 'slide-in-from-bottom-4 0.3s ease-out' : 'none' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Contact</h2>
            <p className="text-gray-400 text-sm mt-1">Update contact information</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="inline size-4 mr-2" />
              Full Name *
            </label>
            <input 
              {...register('name')} 
              className={inputClass(!!errors.name)}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="inline size-4 mr-2" />
              Phone Number *
            </label>
            <input 
              {...register('phone_number')} 
              className={inputClass(!!errors.phone_number)}
              placeholder="+92 300 1234567"
            />
            {errors.phone_number && (
              <p className="text-red-400 text-sm mt-1">{errors.phone_number.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="inline size-4 mr-2" />
              Email (optional)
            </label>
            <input 
              {...register('email')} 
              type="email" 
              className={inputClass(!!errors.email)}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="inline size-4 mr-2" />
              Notes (optional)
            </label>
            <textarea 
              {...register('notes')} 
              rows={3} 
              className={`${inputClass(!!errors.notes)} resize-none`}
              placeholder="Any additional notes..."
            />
            {errors.notes && (
              <p className="text-red-400 text-sm mt-1">{errors.notes.message}</p>
            )}
          </div>

          {/* Error Message */}
          {mutation.error && (
            <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-lg">
              <p className="text-red-400 text-sm">{(mutation.error as Error).message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending || !isDirty}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="size-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
