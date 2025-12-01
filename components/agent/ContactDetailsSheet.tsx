'use client'

import { useState } from 'react'
import { X, Phone, Mail, Building, MapPin, Calendar, Trash2, Edit } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { useContact, useContactProperties, useDeleteContact } from '@/hooks/useAgent'
import EditContactForm from './EditContactForm'
import CallButton from './CallButton'

interface ContactDetailsSheetProps {
  isOpen: boolean
  contactId: string | null
  onClose: () => void
}

export default function ContactDetailsSheet({ isOpen, contactId, onClose }: ContactDetailsSheetProps) {
  const [isEditing, setIsEditing] = useState(false)

  const enabled = isOpen && !!contactId
  const { data: contact, isLoading: loadingContact, error } = useContact(contactId || '')
  const { data: properties = [], isLoading: loadingProps } = useContactProperties(contactId || '')
  const deleteMutation = useDeleteContact()

  const handleDelete = () => {
    if (!contactId) return
    if (confirm('Are you sure you want to delete this contact? Properties linked to this contact will be unlinked but not deleted.')) {
      deleteMutation.mutate(contactId, {
        onSuccess: () => {
          setIsEditing(false)
          onClose()
        }
      })
    }
  }

  const showContent = !loadingContact && !error && contact

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
          width: 'calc(100vw - 320px)', // align with 280px sidebar + small margin
          minWidth: '420px',
          maxWidth: '900px',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Contact Details</p>
              <h2 className="text-xl font-semibold text-white">
                {showContent ? contact!.name : 'Loading...'}
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
            {loadingContact ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : error || !contact ? (
              <ErrorMessage message="Contact not found" />
            ) : (
              <>
                {/* Contact summary card */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {(contact.name || '').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Phone className="size-4 text-gray-500" />
                            <span>{contact.phone_number}</span>
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Mail className="size-4 text-gray-500" />
                              <span>{contact.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="size-3.5" />
                            <span>
                              Added{' '}
                              {new Date(contact.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
                        title="Edit contact"
                      >
                        <Edit className="size-4 text-gray-300" />
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="p-2 bg-red-900/30 border border-red-800/50 hover:border-red-700 rounded-lg transition-all disabled:opacity-50"
                        title="Delete contact"
                      >
                        <Trash2 className="size-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {contact.notes && (
                    <div className="mt-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700/60">
                      <p className="text-xs text-gray-400 mb-1">Notes</p>
                      <p className="text-sm text-gray-200">{contact.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <CallButton contact={contact} variant="primary" size="medium" />
                  </div>
                </div>

                {/* Properties section */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Building className="size-4 text-blue-400" />
                      Linked Properties ({properties.length})
                    </h3>
                  </div>

                  {loadingProps ? (
                    <LoadingSpinner />
                  ) : properties.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="size-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No properties linked to this contact yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                      {properties.map((prop: any) => (
                        <div
                          key={prop.id}
                          className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 hover:bg-gray-800/40 transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                                {prop.address}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <MapPin className="size-3" />
                                <span>{prop.city}{prop.state && `, ${prop.state}`}</span>
                              </div>
                              {prop.property_type && (
                                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                                  {prop.property_type}
                                </span>
                              )}
                            </div>
                            <div className="text-right text-xs">
                              {prop.price && (
                                <p className="text-gray-200 font-semibold mb-1">${prop.price}</p>
                              )}
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                                  prop.is_available === 'true'
                                    ? 'bg-green-900/40 text-green-300'
                                    : 'bg-red-900/40 text-red-300'
                                }`}
                              >
                                {prop.is_available === 'true' ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Inline Edit Modal on top of sheet */}
          {isEditing && contact && (
            <EditContactForm contact={contact} onClose={() => setIsEditing(false)} />
          )}
        </div>
      </div>
    </>
  )
}


