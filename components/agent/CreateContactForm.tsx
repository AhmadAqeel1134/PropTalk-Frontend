// components/agent/CreateContactForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, User, Phone, Mail, FileText } from 'lucide-react'
import { useCreateContact } from '@/hooks/useAgent'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone_number: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CreateContactForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const mutation = useCreateContact()

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Add New Contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(data => {
          mutation.mutate(data, {
            onSuccess: () => onClose()
          })
        })} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="inline size-4 mr-2" />
              Name
            </label>
            <input
              {...register('name')}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="inline size-4 mr-2" />
              Phone Number
            </label>
            <input
              {...register('phone_number')}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone_number && <p className="text-red-400 text-sm mt-1">{errors.phone_number.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="inline size-4 mr-2" />
              Email (optional)
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="inline size-4 mr-2" />
              Notes (optional)
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-70"
            >
              {mutation.isPending ? 'Creating...' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}