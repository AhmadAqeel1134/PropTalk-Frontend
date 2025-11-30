// components/agent/PropertyDetails.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Phone, User, MapPin, Home, DollarSign, Bed, Bath, Square } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import { useProperty, useDeleteProperty } from '@/hooks/useAgent'
import EditPropertyForm from './EditPropertyForm'

export default function PropertyDetails({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const { data: property, isLoading, error } = useProperty(propertyId)
  const [isEditing, setIsEditing] = useState(false)
  const deleteMutation = useDeleteProperty()

  if (isLoading) return <LoadingSpinner />
  if (error || !property) return <ErrorMessage message="Property not found" />

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this property?')) {
      deleteMutation.mutate(propertyId, {
        onSuccess: () => router.push('/agent/properties')
      })
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-full">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
            <ArrowLeft className="size-5" /> Back
          </button>

          {isEditing && property ? (
            <EditPropertyForm property={property} onClose={() => setIsEditing(false)} />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h1 className="text-3xl font-bold text-white">{property.address}</h1>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-3 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg"
                      >
                        <Edit className="size-5" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-3 bg-red-900/50 border border-red-800 hover:border-red-700 rounded-lg"
                      >
                        <Trash2 className="size-5 text-red-400" />
                      </button>
                    </div>
                  </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="flex items-center gap-3"><Bed className="size-6 text-gray-500" /><span className="text-white text-xl">{property.bedrooms || '-'} bed</span></div>
                  <div className="flex items-center gap-3"><Bath className="size-6 text-gray-500" /><span className="text-white text-xl">{property.bathrooms || '-'} bath</span></div>
                  <div className="flex items-center gap-3"><Square className="size-6 text-gray-500" /><span className="text-white text-xl">{property.square_feet || '-'} sqft</span></div>
                  <div className="flex items-center gap-3"><DollarSign className="size-6 text-gray-500" /><span className="text-white text-xl">{property.price || 'N/A'}</span></div>
                </div>

                <div className="space-y-4 text-gray-300">
                  <p className="flex items-center gap-3"><MapPin className="size-5" />{property.city}, {property.state}</p>
                  <p className="flex items-center gap-3"><Home className="size-5" />{property.property_type || 'N/A'}</p>
                  <p className="flex items-center gap-3"><Phone className="size-5" />Owner: {property.owner_phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Linked Contact</h3>
                {property.contact_id ? (
                  <div
                    onClick={() => router.push(`/agent/contacts/${property.contact_id}`)}
                    className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center"><User className="size-6 text-gray-400" /></div>
                    <div>
                      <p className="text-white font-medium">{property.owner_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-400">{property.owner_phone}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No contact linked</p>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}