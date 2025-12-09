// components/agent/EditPropertyForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, MapPin, Home, Phone, User, DollarSign, Bed, Bath, Square, FileText, Loader2, Save } from 'lucide-react'
import { useUpdateProperty, useMyContacts } from '@/hooks/useAgent'
import { useTheme } from '@/contexts/ThemeContext'

const schema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  property_type: z.string().optional(),
  price: z.number().positive().optional().nullable(),
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().min(0).optional().nullable(),
  square_feet: z.number().int().min(0).optional().nullable(),
  description: z.string().optional(),
  amenities: z.string().optional(),
  owner_name: z.string().optional(),
  owner_phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  is_available: z.string().optional(),
  contact_id: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface EditPropertyFormProps {
  property: any
  onClose: () => void
  mode?: 'modal' | 'sheet'
}

export default function EditPropertyForm({ property, onClose, mode = 'modal' }: EditPropertyFormProps) {
  const { theme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  
  const { data: contacts = [] } = useMyContacts()
  
  const { register, handleSubmit, formState: { errors, isDirty }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: property.address,
      city: property.city || '',
      state: property.state || '',
      zip_code: property.zip_code || '',
      property_type: property.property_type || '',
      price: property.price ? parseFloat(property.price) : null,
      bedrooms: property.bedrooms || null,
      bathrooms: property.bathrooms || null,
      square_feet: property.square_feet || null,
      description: property.description || '',
      amenities: property.amenities || '',
      owner_name: property.owner_name || '',
      owner_phone: property.owner_phone || '',
      is_available: property.is_available || 'true',
      contact_id: property.contact_id || '',
    }
  })

  const mutation = useUpdateProperty()
  const selectedContactId = watch('contact_id')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-fill owner info when contact is selected
  useEffect(() => {
    if (selectedContactId && selectedContactId !== property.contact_id) {
      const contact = contacts.find(c => c.id === selectedContactId)
      if (contact) {
        setValue('owner_name', contact.name)
        setValue('owner_phone', contact.phone_number)
      }
    }
  }, [selectedContactId, contacts, setValue, property.contact_id])

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      price: data.price || undefined,
      bedrooms: data.bedrooms || undefined,
      bathrooms: data.bathrooms || undefined,
      square_feet: data.square_feet || undefined,
      contact_id: data.contact_id || undefined,
    }
    
    mutation.mutate({ id: property.id, data: submitData as any }, {
      onSuccess: () => onClose()
    })
  }

  const inputClass = (hasError: boolean) => `w-full px-4 py-3 border rounded-lg placeholder-gray-500 focus:outline-none transition-colors ${
    hasError
      ? 'border-red-600 focus:border-red-500'
      : theme === 'dark'
      ? 'bg-gray-800 border-gray-700 focus:border-gray-500 text-white'
      : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900'
  }`

  const content = (
      <div
        className={`border rounded-xl p-8 max-w-3xl w-full my-8 shadow-2xl ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        }`}
        style={{ animation: isMounted ? 'slide-in-from-bottom-4 0.3s ease-out' : 'none' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Edit Property
            </h2>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Update property information
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Location Section */}
          <div>
            <h3 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <MapPin className="size-4" /> Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input 
                  {...register('address')} 
                  placeholder="Street Address *" 
                  className={inputClass(!!errors.address)}
                />
                {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>}
              </div>
              <input {...register('city')} placeholder="City" className={inputClass(false)} />
              <div className="grid grid-cols-2 gap-4">
                <input {...register('state')} placeholder="State" className={inputClass(false)} />
                <input {...register('zip_code')} placeholder="ZIP Code" className={inputClass(false)} />
              </div>
            </div>
          </div>

          {/* Property Details Section */}
          <div>
            <h3 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Home className="size-4" /> Property Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <select {...register('property_type')} className={inputClass(false)}>
                  <option value="">Property Type</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`} />
                  <input 
                    {...register('price', { valueAsNumber: true })} 
                    type="number" 
                    step="0.01" 
                    placeholder="Price" 
                    className={`${inputClass(false)} pl-10`}
                  />
                </div>
              </div>
              <div className="relative">
                <Bed className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`} />
                <input 
                  {...register('bedrooms', { valueAsNumber: true })} 
                  type="number" 
                  placeholder="Beds" 
                  className={`${inputClass(false)} pl-10`}
                />
              </div>
              <div className="relative">
                <Bath className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`} />
                <input 
                  {...register('bathrooms', { valueAsNumber: true })} 
                  type="number" 
                  step="0.5" 
                  placeholder="Baths" 
                  className={`${inputClass(false)} pl-10`}
                />
              </div>
              <div className="relative col-span-2">
                <Square className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`} />
                <input 
                  {...register('square_feet', { valueAsNumber: true })} 
                  type="number" 
                  placeholder="Square Feet" 
                  className={`${inputClass(false)} pl-10`}
                />
              </div>
            </div>
          </div>

          {/* Owner Section */}
          <div>
            <h3 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <User className="size-4" /> Owner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-xs mb-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  Link to Contact
                </label>
                <select {...register('contact_id')} className={inputClass(false)}>
                  <option value="">Select Contact (Optional)</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} - {contact.phone_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  Owner Name
                </label>
                <input {...register('owner_name')} placeholder="Owner Name" className={inputClass(false)} />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  Owner Phone *
                </label>
                <input 
                  {...register('owner_phone')} 
                  placeholder="Owner Phone *" 
                  className={inputClass(!!errors.owner_phone)}
                />
                {errors.owner_phone && <p className="text-red-400 text-sm mt-1">{errors.owner_phone.message}</p>}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h3 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <FileText className="size-4" /> Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <select {...register('is_available')} className={inputClass(false)}>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
              <textarea 
                {...register('description')} 
                rows={3} 
                placeholder="Description" 
                className={inputClass(false)}
              />
              <textarea 
                {...register('amenities')} 
                rows={2} 
                placeholder="Amenities (comma-separated)" 
                className={inputClass(false)}
              />
            </div>
          </div>

          {/* Error Message */}
          {mutation.error && (
            <div className={`p-3 border rounded-lg ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-800/50'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className="text-red-400 text-sm">{(mutation.error as Error).message}</p>
            </div>
          )}

          {/* Actions */}
          <div className={`flex gap-4 pt-4 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 border rounded-lg font-medium transition-all ${
                theme === 'dark'
                  ? 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
              }`}
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
  )

  if (mode === 'modal') {
    return (
      <div
        className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] overflow-y-auto p-4 ${
          theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {content}
      </div>
    )
  }

  // sheet mode: render just the card; parent (side sheet) manages background
  return content
}
