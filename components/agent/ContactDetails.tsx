// components/agent/ContactDetails.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Phone, Mail, Edit, Trash2, Building } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import { getContactById, getContactProperties } from '@/lib/api'

export default function ContactDetails({ params }: { params: { contactId: string } }) {
  const { data: contact, isLoading: loadingContact } = useQuery({
    queryKey: ['contact', params.contactId],
    queryFn: () => getContactById(params.contactId),
  })

  const { data: properties = [], isLoading: loadingProps } = useQuery({
    queryKey: ['contact-properties', params.contactId],
    queryFn: () => getContactProperties(params.contactId),
  })

  if (loadingContact) return <LoadingSpinner />
  if (!contact) return <ErrorMessage message="Contact not found" />

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="size-5" />
            Back to Contacts
          </button>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-4">{contact.name}</h1>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="size-5 text-gray-500" />
                    <span className="text-gray-300">{contact.phone_number}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="size-5 text-gray-500" />
                      <span className="text-gray-400">{contact.email}</span>
                    </div>
                  )}
                  {contact.notes && (
                    <p className="text-gray-400 mt-4">{contact.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="p-3 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition-all">
                  <Edit className="size-5 text-gray-300" />
                </button>
                <button className="p-3 bg-red-900/50 border border-red-800 hover:border-red-700 rounded-lg transition-all">
                  <Trash2 className="size-5 text-red-400" />
                </button>
              </div>
            </div>

            <button className="flex items-center gap-3 bg-gray-800 border border-gray-700 hover:border-gray-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all">
              <Phone className="size-6" />
              Call {contact.name}
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <Building className="size-7" />
              Properties ({properties.length})
            </h2>

            {loadingProps ? (
              <LoadingSpinner />
            ) : properties.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No properties linked to this contact</p>
            ) : (
              <div className="grid gap-4">
                {properties.map((prop) => (
                  <div key={prop.id} className="border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-white font-medium text-lg">{prop.address}</p>
                        <p className="text-gray-500">{prop.city}, {prop.state}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${prop.is_available === 'yes' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {prop.is_available === 'yes' ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}