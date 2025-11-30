// components/agent/CreatePropertyForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useCreateProperty } from '@/hooks/useAgent'

const schema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  property_type: z.string().optional(),
  price: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  square_feet: z.number().optional(),
  description: z.string().optional(),
  amenities: z.string().optional(),
  owner_name: z.string().optional(),
  owner_phone: z.string().min(1, 'Owner phone is required'),
  is_available: z.string().optional(),
  contact_id: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CreatePropertyForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const mutation = useCreateProperty()

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Add New Property</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="size-6" /></button>
        </div>

        <form onSubmit={handleSubmit(data => {
          const submitData = {
            ...data,
            is_available: data.is_available || 'true',
          }
          mutation.mutate(submitData as any, {
            onSuccess: () => onClose()
          })
        })} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input {...register('address')} placeholder="Address *" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <input {...register('city')} placeholder="City" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <input {...register('state')} placeholder="State" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <input {...register('zip_code')} placeholder="ZIP Code" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <input {...register('property_type')} placeholder="Type (House, Condo, etc)" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <input {...register('price', { valueAsNumber: true })} type="number" step="0.01" placeholder="Price" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <input {...register('bedrooms', { valueAsNumber: true })} type="number" placeholder="Bedrooms" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <input {...register('bathrooms', { valueAsNumber: true })} type="number" step="0.5" placeholder="Bathrooms" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <input {...register('square_feet', { valueAsNumber: true })} type="number" placeholder="Square Feet" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <input {...register('owner_name')} placeholder="Owner Name" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <input {...register('owner_phone')} placeholder="Owner Phone *" className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <textarea {...register('description')} rows={3} placeholder="Description" className="md:col-span-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />
          <textarea {...register('amenities')} rows={2} placeholder="Amenities (comma-separated)" className="md:col-span-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500" />

          <div className="md:col-span-2 flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              Create Property
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}