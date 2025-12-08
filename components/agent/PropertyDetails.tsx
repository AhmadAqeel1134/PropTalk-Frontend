// components/agent/PropertyDetails.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Edit, Trash2, Phone, User, MapPin, Home, 
  DollarSign, Bed, Bath, Square, Calendar, Building,
  CheckCircle, XCircle, PhoneCall
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import { useProperty, useDeleteProperty, useContact } from '@/hooks/useAgent'
import EditPropertyForm from './EditPropertyForm'
import CallButton from './CallButton'

export default function PropertyDetails({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const { data: property, isLoading, error } = useProperty(propertyId)
  const [isEditing, setIsEditing] = useState(false)
  const deleteMutation = useDeleteProperty()

  // Fetch contact details if property has a linked contact
  const { data: linkedContact } = useContact(property?.contact_id || '')

  if (isLoading) return <LoadingSpinner />
  if (error || !property) return <ErrorMessage message="Property not found" />

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this property?')) {
      deleteMutation.mutate(propertyId, {
        onSuccess: () => router.push('/agent/properties')
      })
    }
  }

  const isAvailable = property.is_available === 'true'

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => router.push('/agent/properties')} 
              className="px-5 py-2.5 bg-gray-800/60 border-2 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-200"
            >
              Back
            </button>
          </div>

          {isEditing && property ? (
            <EditPropertyForm property={property} onClose={() => setIsEditing(false)} />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Property Header Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  {/* Property Image Placeholder */}
                  <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-800 flex items-center justify-center">
                    <Building className="size-24 text-gray-700" />
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                            isAvailable 
                              ? 'bg-green-900/30 text-green-400 border border-green-800/50' 
                              : 'bg-red-900/30 text-red-400 border border-red-800/50'
                          }`}>
                            {isAvailable ? (
                              <><CheckCircle className="size-4" /> Available</>
                            ) : (
                              <><XCircle className="size-4" /> Unavailable</>
                            )}
                          </span>
                          {property.property_type && (
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
                              {property.property_type}
                            </span>
                          )}
                        </div>
                        <h1 className="text-3xl font-bold text-white">{property.address}</h1>
                        <div className="flex items-center gap-2 mt-2 text-gray-400">
                          <MapPin className="size-5" />
                          <span>{property.city}{property.state && `, ${property.state}`}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-3 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
                          title="Edit Property"
                        >
                          <Edit className="size-5 text-gray-300" />
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                          className="p-3 bg-red-900/30 border border-red-800/50 hover:border-red-700 rounded-lg transition-all disabled:opacity-50"
                          title="Delete Property"
                        >
                          <Trash2 className="size-5 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    {property.price && (
                      <div className="mb-6">
                        <p className="text-4xl font-bold text-white flex items-center gap-2">
                          <DollarSign className="size-8 text-emerald-400" />
                          {property.price}
                        </p>
                      </div>
                    )}

                    {/* Property Stats */}
                    <div className="grid grid-cols-3 gap-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Bed className="size-5 text-blue-400" />
                          <span className="text-2xl font-bold text-white">{property.bedrooms || '-'}</span>
                        </div>
                        <p className="text-sm text-gray-500">Bedrooms</p>
                      </div>
                      <div className="text-center border-x border-gray-700">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Bath className="size-5 text-blue-400" />
                          <span className="text-2xl font-bold text-white">{property.bathrooms || '-'}</span>
                        </div>
                        <p className="text-sm text-gray-500">Bathrooms</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Square className="size-5 text-blue-400" />
                          <span className="text-2xl font-bold text-white">{property.square_feet || '-'}</span>
                        </div>
                        <p className="text-sm text-gray-500">Sq. Feet</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description (if any) */}
                {property.description && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{property.description}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Owner / Contact Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="size-5 text-gray-400" />
                    Property Owner
                  </h3>
                  
                  <div className="space-y-4">
                    {linkedContact ? (
                      <>
                        <div
                          onClick={() => router.push(`/agent/contacts/${property.contact_id}`)}
                          className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors group"
                        >
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                            {linkedContact.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                              {linkedContact.name}
                            </p>
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
                            phone_number: linkedContact.phone_number
                          }}
                          variant="primary"
                          size="large"
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                          <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="size-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{property.owner_name || 'Unknown Owner'}</p>
                            <p className="text-sm text-gray-400">{property.owner_phone}</p>
                          </div>
                        </div>
                        
                        {property.owner_phone && (
                          <button
                            onClick={() => console.log('Call owner:', property.owner_phone)}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-4 rounded-lg font-medium transition-all"
                          >
                            <PhoneCall className="size-5" />
                            Call Owner
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Property Type</span>
                      <span className="text-white">{property.property_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={isAvailable ? 'text-green-400' : 'text-red-400'}>
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    {property.zip_code && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">ZIP Code</span>
                        <span className="text-white">{property.zip_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
