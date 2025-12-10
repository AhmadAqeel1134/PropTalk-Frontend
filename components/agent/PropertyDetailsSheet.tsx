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
import { useTheme } from '@/contexts/ThemeContext'

interface PropertyDetailsSheetProps {
  isOpen: boolean
  propertyId: string | null
  onClose: () => void
}

export default function PropertyDetailsSheet({ isOpen, propertyId, onClose }: PropertyDetailsSheetProps) {
  const { theme } = useTheme()
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
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
          }`}
          onClick={onClose}
        />
      )}

      {/* Side sheet */}
      <div
        className={`fixed top-0 right-0 h-full border-l z-50 transform transition-transform duration-300 ease-out ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        } ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: theme === 'dark' ? 'rgba(10, 15, 25, 0.97)' : 'rgba(255, 255, 255, 0.98)',
          width: 'calc(100vw - 320px)', // align with sidebar + margin
          minWidth: '480px',
          maxWidth: '1000px',
        }}
      >
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div
            className={`p-6 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}
          >
            <div>
              <p className={`text-xs uppercase tracking-wide mb-1 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Property Details
              </p>
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {showContent ? property!.address : 'Loading property...'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg border transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 shadow-sm'
              }`}
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
                <div
                  className={`border rounded-xl overflow-hidden ${
                    theme === 'dark'
                      ? 'bg-gray-900 border-gray-800'
                      : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  {/* Image placeholder */}
                  <div
                    className={`h-40 border-b flex items-center justify-center ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-800'
                        : 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-200'
                    }`}
                  >
                    <Building className={`size-20 ${
                      theme === 'dark' ? 'text-gray-700' : 'text-gray-400'
                    }`} />
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                              isAvailable
                                ? theme === 'dark'
                                  ? 'bg-green-900/30 text-green-400 border-green-800/40'
                                  : 'bg-green-100 text-green-700 border-green-300'
                                : theme === 'dark'
                                ? 'bg-red-900/30 text-red-400 border-red-800/40'
                                : 'bg-red-100 text-red-700 border-red-300'
                            }`}
                          >
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                          {property.property_type && (
                            <span className={`px-3 py-1 text-xs rounded-full ${
                              theme === 'dark'
                                ? 'bg-gray-800 text-gray-300'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {property.property_type}
                            </span>
                          )}
                        </div>
                        <h3 className={`text-lg font-semibold mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {property.address}
                        </h3>
                        <div className={`flex items-center gap-2 text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
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
                          className={`p-2 border rounded-lg transition-all ${
                            theme === 'dark'
                              ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                              : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                          }`}
                          title="Edit property"
                        >
                          <Edit className={`size-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`} />
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                          className={`p-2 border rounded-lg transition-all disabled:opacity-50 ${
                            theme === 'dark'
                              ? 'bg-red-900/30 border-red-800/50 hover:border-red-700'
                              : 'bg-red-50 border-red-200 hover:border-red-300'
                          }`}
                          title="Delete property"
                        >
                          <Trash2 className={`size-4 ${
                            theme === 'dark' ? 'text-red-400' : 'text-red-600'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {property.price && (
                      <p className={`text-2xl font-bold flex items-center gap-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <DollarSign className={`size-6 ${
                          theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                        }`} />
                        {property.price}
                      </p>
                    )}

                    {/* Stats row */}
                    <div
                      className={`grid grid-cols-3 gap-3 p-3 rounded-lg border text-center ${
                        theme === 'dark'
                          ? 'bg-gray-800/40 border-gray-700/40'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Bed className={`size-4 ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                          <span className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {property.bedrooms || '-'}
                          </span>
                        </div>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Bedrooms
                        </p>
                      </div>
                      <div className={`border-x px-2 ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Bath className={`size-4 ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                          <span className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {property.bathrooms || '-'}
                          </span>
                        </div>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Bathrooms
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Square className={`size-4 ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                          <span className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {property.square_feet || '-'}
                          </span>
                        </div>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Sq. Feet
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {property.description && (
                      <div className="mt-3">
                        <p className={`text-xs mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Description
                        </p>
                        <p className={`text-sm leading-relaxed ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          {property.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Owner / contact card */}
                <div
                  className={`border rounded-xl p-6 ${
                    theme === 'dark'
                      ? 'bg-gray-900 border-gray-800'
                      : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <User className={`size-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    Property Owner
                  </h3>

                  <div className="space-y-4">
                    {linkedContact ? (
                      <>
                        <div
                          className={`flex items-center gap-4 p-4 rounded-lg ${
                            theme === 'dark'
                              ? 'bg-gray-800/50'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                            {(linkedContact.name || '').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {linkedContact.name}
                            </p>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {linkedContact.phone_number}
                            </p>
                            {linkedContact.email && (
                              <p className={`text-xs mt-1 ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                {linkedContact.email}
                              </p>
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
                        <div
                          className={`flex items-center gap-4 p-4 rounded-lg ${
                            theme === 'dark'
                              ? 'bg-gray-800/50'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              theme === 'dark'
                                ? 'bg-gray-700'
                                : 'bg-gray-200'
                            }`}
                          >
                            <User className={`size-5 ${
                              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`} />
                          </div>
                          <div>
                            <p className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {property.owner_name || 'Unknown Owner'}
                            </p>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {property.owner_phone}
                            </p>
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
            <div
              className={`absolute inset-0 backdrop-blur-sm z-[55] flex items-start justify-center overflow-y-auto p-4 ${
                theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
              }`}
            >
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


