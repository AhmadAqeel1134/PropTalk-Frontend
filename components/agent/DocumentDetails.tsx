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
import { useTheme } from '@/contexts/ThemeContext'

export default function DocumentDetails({ documentId }: { documentId: string }) {
  const { theme } = useTheme()
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
      <div
        className="min-h-screen p-6 md:p-8"
        style={
          theme === 'dark'
            ? { background: 'rgba(10, 15, 25, 0.95)' }
            : { background: 'rgba(248, 250, 252, 0.98)' }
        }
      >
        {/* Use full-width layout starting right from the sidebar, same as other agent pages */}
        <div className="max-w-full">
          {/* Back Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => router.push('/agent/documents')}
              className={`px-5 py-2.5 border-2 rounded-xl font-semibold transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white'
                  : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-700 shadow-sm'
              }`}
            >
              Back
            </button>
          </div>

          {/* Document Header Card */}
          <div
            className={`border rounded-xl p-8 mb-8 ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-start gap-6">
                <div
                  className={`p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  {getFileIcon()}
                </div>
                <div>
                  <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {document.file_name}
                  </h1>
                  <div className={`flex flex-wrap items-center gap-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-800'
                        : 'bg-gray-100'
                    }`}>
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
                    <p className={`mt-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {document.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(document.cloudinary_url, '_blank')}
                  className={`p-3 border rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                  title="Download"
                >
                  <Download className={`size-5 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className={`p-3 border rounded-lg transition-all disabled:opacity-50 ${
                    theme === 'dark'
                      ? 'bg-red-900/30 border-red-800/50 hover:border-red-700'
                      : 'bg-red-50 border-red-200 hover:border-red-300'
                  }`}
                  title="Delete"
                >
                  <Trash2 className={`size-5 ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div
                className={`rounded-xl p-4 border ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700/50'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Building className={`size-5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Properties
                  </span>
                </div>
                <p className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {properties.length}
                </p>
              </div>
              <div
                className={`rounded-xl p-4 border ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700/50'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className={`size-5 ${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Contacts
                  </span>
                </div>
                <p className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {contacts.length}
                </p>
              </div>
              <div
                className={`col-span-2 rounded-xl p-4 border ${
                  theme === 'dark'
                    ? 'bg-emerald-900/20 border-emerald-800/30'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${
                      theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
                    }`}>
                      Ready for Calling
                    </p>
                    <p className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-emerald-300/70' : 'text-emerald-600/80'
                    }`}>
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
            <div
              className={`border rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold flex items-center gap-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Users className={`size-6 ${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                  Extracted Contacts ({contacts.length})
                </h2>
              </div>
              
              {loadingContacts ? (
                <LoadingSpinner />
              ) : contacts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className={`size-12 mx-auto mb-3 ${
                    theme === 'dark' ? 'text-gray-700' : 'text-gray-400'
                  }`} />
                  <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}>
                    No contacts extracted
                  </p>
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-500'
                  }`}>
                    CSV files with owner_name and owner_phone columns will populate this
                  </p>
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
                      className={`p-4 border rounded-lg cursor-pointer transition-all group ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 shadow-sm'
                      }`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                            {contact.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className={`font-medium transition-colors ${
                              theme === 'dark'
                                ? 'text-white group-hover:text-emerald-400'
                                : 'text-gray-900 group-hover:text-emerald-700'
                            }`}>
                              {contact.name}
                            </p>
                            <p className={`text-sm flex items-center gap-1 ${
                              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              <Phone className="size-3" />
                              {contact.phone_number}
                            </p>
                          </div>
                        </div>
                        {contact.properties_count > 0 && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            theme === 'dark'
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
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
            <div
              className={`border rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold flex items-center gap-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Building className={`size-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  Extracted Properties ({properties.length})
                </h2>
              </div>
              
              {loadingProps ? (
                <LoadingSpinner />
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <Building className={`size-12 mx-auto mb-3 ${
                    theme === 'dark' ? 'text-gray-700' : 'text-gray-400'
                  }`} />
                  <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}>
                    No properties extracted
                  </p>
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-500'
                  }`}>
                    Make sure your document has address information
                  </p>
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
                      className={`p-4 border rounded-lg cursor-pointer transition-all group ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 shadow-sm'
                      }`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium transition-colors ${
                            theme === 'dark'
                              ? 'text-white group-hover:text-blue-400'
                              : 'text-gray-900 group-hover:text-blue-700'
                          }`}>
                            {prop.address}
                          </p>
                          <p className={`text-sm flex items-center gap-1 mt-1 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            <MapPin className="size-3" />
                            {prop.city}{prop.state && `, ${prop.state}`}
                            {prop.property_type && (
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                theme === 'dark'
                                  ? 'bg-gray-700'
                                  : 'bg-gray-200'
                              }`}>
                                {prop.property_type}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          {prop.price && (
                            <p className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              ${prop.price}
                            </p>
                          )}
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                            prop.is_available === 'true'
                              ? theme === 'dark'
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-green-100 text-green-700'
                              : theme === 'dark'
                              ? 'bg-red-900/50 text-red-400'
                              : 'bg-red-100 text-red-700'
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
