'use client'

import { useState } from 'react'
import { useDocument, useDocumentProperties, useDocumentContacts, useDeleteDocument } from '@/hooks/useAgent'
import { Download, Trash2, FileText, Building, Users, Phone, MapPin, FileSpreadsheet, FileType, Calendar } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import { useRouter } from 'next/navigation'
import BatchCallButton from './BatchCallButton'
import PropertyDetailsSheet from './PropertyDetailsSheet'
import ContactDetailsSheet from './ContactDetailsSheet'

export default function DocumentDetails({ documentId }: { documentId: string }) {
  const router = useRouter()
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [isPropertySheetOpen, setIsPropertySheetOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false)
  const { data: document, isLoading, error } = useDocument(documentId)
  const { data: properties = [], isLoading: loadingProps } = useDocumentProperties(documentId)
  const { data: contacts = [], isLoading: loadingContacts } = useDocumentContacts(documentId)
  const deleteMutation = useDeleteDocument()

  if (isLoading) return <LoadingSpinner />
  if (error || !document) return <ErrorMessage message="Document not found" />

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this document? All properties extracted from it will also be deleted.')) {
      deleteMutation.mutate(documentId, {
        onSuccess: () => router.push('/agent/documents')
      })
    }
  }

  const getFileIcon = () => {
    switch (document.file_type?.toLowerCase()) {
      case 'pdf':
        return <FileText className="size-12 text-red-400" />
      case 'csv':
        return <FileSpreadsheet className="size-12 text-green-400" />
      case 'docx':
        return <FileType className="size-12 text-blue-400" />
      default:
        return <FileText className="size-12 text-gray-400" />
    }
  }

  // Prepare contacts for batch call
  const callableContacts = contacts.map((c: any) => ({
    id: c.id,
    name: c.name,
    phone_number: c.phone_number
  }))

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        {/* Use full-width layout starting right from the sidebar, same as other agent pages */}
        <div className="max-w-full">
          {/* Back Button */}
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => router.push('/agent/documents')} 
              className="px-5 py-2.5 bg-gray-800/60 border-2 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-200"
            >
              Back
            </button>
          </div>

          {/* Document Header Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-gray-800 rounded-xl">
                  {getFileIcon()}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{document.file_name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-400">
                    <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                      {document.file_type?.toUpperCase()}
                    </span>
                    {document.file_size && (
                      <span className="text-sm">{document.file_size}</span>
                    )}
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar className="size-4" />
                      {new Date(document.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {document.description && (
                    <p className="mt-4 text-gray-400">{document.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(document.cloudinary_url, '_blank')}
                  className="p-3 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
                  title="Download"
                >
                  <Download className="size-5 text-gray-300" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="p-3 bg-red-900/30 border border-red-800/50 hover:border-red-700 rounded-lg transition-all disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="size-5 text-red-400" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="size-5 text-blue-400" />
                  <span className="text-gray-400">Properties</span>
                </div>
                <p className="text-3xl font-bold text-white">{properties.length}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="size-5 text-emerald-400" />
                  <span className="text-gray-400">Contacts</span>
                </div>
                <p className="text-3xl font-bold text-white">{contacts.length}</p>
              </div>
              <div className="col-span-2 bg-emerald-900/20 rounded-xl p-4 border border-emerald-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-400 font-medium">Ready for Calling</p>
                    <p className="text-emerald-300/70 text-sm mt-1">
                      {contacts.length} contacts can be reached
                    </p>
                  </div>
                  {contacts.length > 0 && (
                    <BatchCallButton contacts={callableContacts} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contacts Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Users className="size-6 text-emerald-400" />
                  Extracted Contacts ({contacts.length})
                </h2>
              </div>
              
              {loadingContacts ? (
                <LoadingSpinner />
              ) : contacts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="size-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No contacts extracted</p>
                  <p className="text-gray-600 text-sm mt-1">CSV files with owner_name and owner_phone columns will populate this</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {contacts.map((contact: any, i: number) => (
                    <div
                      key={contact.id}
                      onClick={() => {
                        setSelectedContactId(contact.id)
                        setIsContactSheetOpen(true)
                      }}
                      className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-gray-600 cursor-pointer transition-all group"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                            {contact.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                              {contact.name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="size-3" />
                              {contact.phone_number}
                            </p>
                          </div>
                        </div>
                        {contact.properties_count > 0 && (
                          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full">
                            {contact.properties_count} properties
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Properties Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Building className="size-6 text-blue-400" />
                  Extracted Properties ({properties.length})
                </h2>
              </div>
              
              {loadingProps ? (
                <LoadingSpinner />
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="size-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No properties extracted</p>
                  <p className="text-gray-600 text-sm mt-1">Make sure your document has address information</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {properties.map((prop: any, i: number) => (
                    <div
                      key={prop.id}
                      onClick={() => {
                        setSelectedPropertyId(prop.id)
                        setIsPropertySheetOpen(true)
                      }}
                      className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-gray-600 cursor-pointer transition-all group"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            {prop.address}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="size-3" />
                            {prop.city}{prop.state && `, ${prop.state}`}
                            {prop.property_type && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded text-xs">
                                {prop.property_type}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          {prop.price && (
                            <p className="text-white font-medium">${prop.price}</p>
                          )}
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                            prop.is_available === 'true' 
                              ? 'bg-green-900/50 text-green-400' 
                              : 'bg-red-900/50 text-red-400'
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
        </div>
      </div>

      {/* Property Details Side Sheet */}
      <PropertyDetailsSheet
        isOpen={isPropertySheetOpen}
        propertyId={selectedPropertyId}
        onClose={() => {
          setIsPropertySheetOpen(false)
          setTimeout(() => setSelectedPropertyId(null), 200)
        }}
      />

      {/* Contact Details Side Sheet */}
      <ContactDetailsSheet
        isOpen={isContactSheetOpen}
        contactId={selectedContactId}
        onClose={() => {
          setIsContactSheetOpen(false)
          setTimeout(() => setSelectedContactId(null), 200)
        }}
      />
    </PageTransition>
  )
}
