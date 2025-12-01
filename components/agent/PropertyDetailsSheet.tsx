'use client'

import { useState } from 'react'
import {
  X,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  Building,
  User,
  PhoneCall,
  Trash2,
  Edit,
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { useProperty, useDeleteProperty, useContact } from '@/hooks/useAgent'
import EditPropertyForm from './EditPropertyForm'
import CallButton from './CallButton'

interface PropertyDetailsSheetProps {
  isOpen: boolean
  propertyId: string | null
  onClose: () => void
}

export default function PropertyDetailsSheet({ isOpen, propertyId, onClose }: PropertyDetailsSheetProps) {
  const [isEditing, setIsEditing] = useState(false)

  const { data: property, isLoading, error } = useProperty(propertyId || '')
  const deleteMutation = useDeleteProperty()

  // Linked contact (if any)
  const { data: linkedContact } = useContact(property?.contact_id || '')

  const handleDelete = () => {
    if (!propertyId) return
    if (confirm('Are you sure you want to delete this property?')) {
      deleteMutation.mutate(propertyId, {
        onSuccess: () => {
          setIsEditing(false)
          onClose()
        },
      })
    }
  }

  const isAvailable = property?.is_available === 'true'
  const showContent = !isLoading && !error && property

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Side sheet */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-900 border-l border-gray-800 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(10, 15, 25, 0.97)',
          width: 'calc(100vw - 320px)', // align with sidebar + margin
          minWidth: '480px',
          maxWidth: '1000px',
        }}
      >
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Property Details</p>
              <h2 className="text-xl font-semibold text-white">
                {showContent ? property!.address : 'Loading property...'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white transition-all"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : error || !property ? (
              <ErrorMessage message="Property not found" />
            ) : (
              <>
                {/* Main property card */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  {/* Image placeholder */}
                  <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-800 flex items-center justify-center">
                    <Building className="size-20 text-gray-700" />
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                              isAvailable
                                ? 'bg-green-900/30 text-green-400 border border-green-800/40'
                                : 'bg-red-900/30 text-red-400 border border-red-800/40'
                            }`}
                          >
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                          {property.property_type && (
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                              {property.property_type}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{property.address}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <MapPin className="size-4" />
                          <span>
                            {property.city}
                            {property.state && `, ${property.state}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-2 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
                          title="Edit property"
                        >
                          <Edit className="size-4 text-gray-300" />
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                          className="p-2 bg-red-900/30 border border-red-800/50 hover:border-red-700 rounded-lg transition-all disabled:opacity-50"
                          title="Delete property"
                        >
                          <Trash2 className="size-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {property.price && (
                      <p className="text-2xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="size-6 text-emerald-400" />
                        {property.price}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/40 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Bed className="size-4 text-blue-400" />
                          <span className="text-lg font-semibold text-white">
                            {property.bedrooms || '-'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Bedrooms</p>
                      </div>
                      <div className="border-x border-gray-700 px-2">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Bath className="size-4 text-blue-400" />
                          <span className="text-lg font-semibold text-white">
                            {property.bathrooms || '-'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Bathrooms</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Square className="size-4 text-blue-400" />
                          <span className="text-lg font-semibold text-white">
                            {property.square_feet || '-'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Sq. Feet</p>
                      </div>
                    </div>

                    {/* Description */}
                    {property.description && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-1">Description</p>
                        <p className="text-sm text-gray-200 leading-relaxed">{property.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Owner / contact card */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="size-4 text-gray-400" />
                    Property Owner
                  </h3>

                  <div className="space-y-4">
                    {linkedContact ? (
                      <>
                        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                            {(linkedContact.name || '').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{linkedContact.name}</p>
                            <p className="text-sm text-gray-400">{linkedContact.phone_number}</p>
                            {linkedContact.email && (
                              <p className="text-xs text-gray-500 mt-1">{linkedContact.email}</p>
                            )}
                          </div>
                        </div>
                        <CallButton
                          contact={{
                            id: linkedContact.id,
                            name: linkedContact.name,
                            phone_number: linkedContact.phone_number,
                          }}
                          variant="primary"
                          size="medium"
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="size-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {property.owner_name || 'Unknown Owner'}
                            </p>
                            <p className="text-sm text-gray-400">{property.owner_phone}</p>
                          </div>
                        </div>
                        {property.owner_phone && (
                          <button
                            onClick={() => console.log('Call owner:', property.owner_phone)}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-lg font-medium transition-all"
                          >
                            <PhoneCall className="size-5" />
                            Call Owner
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Edit form inline inside the sheet */}
          {isEditing && property && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[55] flex items-start justify-center overflow-y-auto p-4">
              <EditPropertyForm
                property={property}
                onClose={() => setIsEditing(false)}
                mode="sheet"
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}


