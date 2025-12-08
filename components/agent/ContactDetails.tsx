// components/agent/ContactDetails.tsx
'use client'

import { useState } from 'react'
import { Phone, Mail, Edit, Trash2, Building, PhoneCall, MapPin, Calendar } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import { useContact, useContactProperties, useDeleteContact, useUpdateContact } from '@/hooks/useAgent'
import { useRouter } from 'next/navigation'
import EditContactForm from './EditContactForm'
import CallButton from './CallButton'

interface ContactDetailsProps {
  contactId: string
}

export default function ContactDetails({ contactId }: ContactDetailsProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  
  const { data: contact, isLoading: loadingContact, error } = useContact(contactId)
  const { data: properties = [], isLoading: loadingProps } = useContactProperties(contactId)
  const deleteMutation = useDeleteContact()

  if (loadingContact) return <LoadingSpinner />
  if (error || !contact) return <ErrorMessage message="Contact not found" />

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this contact? Properties linked to this contact will be unlinked but not deleted.')) {
      deleteMutation.mutate(contactId, {
        onSuccess: () => router.push('/agent/contacts')
      })
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => router.push('/agent/contacts')}
              className="px-5 py-2.5 bg-gray-800/60 border-2 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-200"
            >
              Back
            </button>
          </div>

          {/* Contact Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{contact.name}</h1>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Phone className="size-5 text-gray-500" />
                      <span className="text-gray-300 font-medium">{contact.phone_number}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="size-5 text-gray-500" />
                        <span className="text-gray-400">{contact.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="size-5 text-gray-500" />
                      <span className="text-gray-500 text-sm">
                        Added {new Date(contact.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-3 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
                >
                  <Edit className="size-5 text-gray-300" />
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="p-3 bg-red-900/30 border border-red-800/50 hover:border-red-700 rounded-lg transition-all disabled:opacity-50"
                >
                  <Trash2 className="size-5 text-red-400" />
                </button>
              </div>
            </div>

            {/* Notes */}
            {contact.notes && (
              <div className="mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <p className="text-sm text-gray-400 font-medium mb-2">Notes</p>
                <p className="text-gray-300">{contact.notes}</p>
              </div>
            )}

            {/* Call Action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <CallButton 
                contact={contact}
                variant="primary"
                size="large"
              />
              <button 
                onClick={() => router.push(`/agent/properties?contact_id=${contactId}`)}
                className="flex items-center justify-center gap-3 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-8 py-4 rounded-lg font-medium transition-all"
              >
                <Building className="size-5" />
                View Linked Properties
              </button>
            </div>
          </div>

          {/* Properties Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                <Building className="size-7 text-blue-400" />
                Properties ({properties.length})
              </h2>
            </div>

            {loadingProps ? (
              <LoadingSpinner />
            ) : properties.length === 0 ? (
              <div className="text-center py-16">
                <Building className="size-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No properties linked to this contact</p>
                <p className="text-gray-600 text-sm mt-2">Properties from uploaded documents will appear here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {properties.map((prop: any) => (
                  <div 
                    key={prop.id} 
                    onClick={() => router.push(`/agent/properties/${prop.id}`)}
                    className="border border-gray-800 rounded-lg p-5 hover:border-gray-700 hover:bg-gray-800/30 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium text-lg group-hover:text-blue-400 transition-colors">
                          {prop.address}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-gray-500">
                          <MapPin className="size-4" />
                          <span>{prop.city}{prop.state && `, ${prop.state}`}</span>
                        </div>
                        {prop.property_type && (
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                            {prop.property_type}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {prop.price && (
                          <p className="text-white font-bold text-lg">${prop.price}</p>
                        )}
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                          prop.is_available === 'true' 
                            ? 'bg-green-900/50 text-green-300' 
                            : 'bg-red-900/50 text-red-300'
                        }`}>
                          {prop.is_available === 'true' ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <EditContactForm
            contact={contact}
            onClose={() => setIsEditing(false)}
          />
        )}
      </div>
    </PageTransition>
  )
}
