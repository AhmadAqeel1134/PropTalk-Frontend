'use client'

import { useDocument, useDocumentProperties, useDocumentContacts, useDeleteDocument } from '@/hooks/useAgent'
import { ArrowLeft, Download, Trash2, FileText, Building, Users } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import { useRouter } from 'next/navigation'

export default function DocumentDetails({ documentId }: { documentId: string }) {
  const router = useRouter()
  const { data: document, isLoading, error } = useDocument(documentId)
  const { data: properties = [] } = useDocumentProperties(documentId)
  const { data: contacts = [] } = useDocumentContacts(documentId)
  const deleteMutation = useDeleteDocument()

  if (isLoading) return <LoadingSpinner />
  if (error || !document) return <ErrorMessage message="Document not found" />

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(documentId, {
        onSuccess: () => router.push('/agent/documents')
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

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{document.file_name}</h1>
                <div className="flex items-center gap-4 text-gray-400">
                  <span>{document.file_type.toUpperCase()}</span>
                  {document.file_size && <span>• {document.file_size}</span>}
                  <span>• {new Date(document.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(document.cloudinary_url, '_blank')}
                  className="p-3 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg"
                >
                  <Download className="size-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-3 bg-red-900/50 border border-red-800 hover:border-red-700 rounded-lg"
                >
                  <Trash2 className="size-5 text-red-400" />
                </button>
              </div>
            </div>

            {document.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                <p className="text-gray-300">{document.description}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="size-5 text-gray-400" />
                  <span className="text-gray-300">Properties Extracted</span>
                </div>
                <p className="text-3xl font-bold text-white">{properties.length}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="size-5 text-gray-400" />
                  <span className="text-gray-300">Contacts Extracted</span>
                </div>
                <p className="text-3xl font-bold text-white">{contacts.length}</p>
              </div>
            </div>
          </div>

          {/* Properties Section */}
          {properties.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Extracted Properties</h2>
              <div className="space-y-4">
                {properties.map((prop: any) => (
                  <div
                    key={prop.id}
                    onClick={() => router.push(`/agent/properties/${prop.id}`)}
                    className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition-all"
                  >
                    <p className="text-white font-medium">{prop.address}</p>
                    <p className="text-sm text-gray-400">{prop.city} • {prop.property_type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacts Section */}
          {contacts.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Extracted Contacts</h2>
              <div className="space-y-4">
                {contacts.map((contact: any) => (
                  <div
                    key={contact.id}
                    onClick={() => router.push(`/agent/contacts/${contact.id}`)}
                    className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition-all"
                  >
                    <p className="text-white font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-400">{contact.phone_number}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

