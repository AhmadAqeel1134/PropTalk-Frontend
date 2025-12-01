'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, User, Mail, Phone, Building, MapPin } from 'lucide-react'
import { useUpdateAgentProfile } from '@/hooks/useAgent'

const schema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface EditProfileFormProps {
  profile: {
    id: string
    email: string
    full_name: string
    company_name: string | null
    phone: string | null
    address: string | null
  }
  onClose: () => void
}

export default function EditProfileForm({ profile, onClose }: EditProfileFormProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile.full_name,
      email: profile.email,
      company_name: profile.company_name || '',
      phone: profile.phone || '',
      address: profile.address || '',
    }
  })

  const mutation = useUpdateAgentProfile()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4"
      style={{
        animation: 'fade-in 0.3s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-3xl w-full"
        style={{
          animation: isMounted ? 'slide-in-from-bottom-4 0.4s ease-out' : 'none',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Edit Profile</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(data => {
          mutation.mutate(data, {
            onSuccess: () => onClose()
          })
        })} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div style={{ animationDelay: '0.1s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="inline size-4 mr-2" />
                Full Name
              </label>
              <input
                {...register('full_name')}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors"
                placeholder="John Doe"
              />
              {errors.full_name && <p className="text-red-400 text-sm mt-1">{errors.full_name.message}</p>}
            </div>

            <div style={{ animationDelay: '0.15s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="inline size-4 mr-2" />
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div style={{ animationDelay: '0.2s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Building className="inline size-4 mr-2" />
                Company Name (optional)
              </label>
              <input
                {...register('company_name')}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            <div style={{ animationDelay: '0.25s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="inline size-4 mr-2" />
                Phone (optional)
              </label>
              <input
                {...register('phone')}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
          </div>

          <div style={{ animationDelay: '0.3s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="inline size-4 mr-2" />
              Address (optional)
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4 animate-[slide-in-from-bottom-2_0.5s_ease-out]" style={{ animationDelay: '0.35s' }}>
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
              {mutation.isPending ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

