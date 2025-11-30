// components/agent/DocumentsList.tsx
'use client'

import { useMyDocuments, useDeleteDocument } from '@/hooks/useAgent'
import { Upload, FileText } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DocumentCard from './DocumentCard'

export default function DocumentsList() {
  const { data: documents = [], isLoading } = useMyDocuments()
  const deleteMutation = useDeleteDocument()

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Documents</h1>
          <button
            onClick={() => window.location.href = '/agent/documents/upload'}
            className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg"
          >
            <Upload className="size-5" /> Upload Document
          </button>
        </div>

        {isLoading ? <LoadingSpinner /> : documents.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="size-20 text-gray-700 mx-auto mb-6" />
            <p className="text-gray-400 text-xl">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc, i) => (
              <div key={doc.id} className="opacity-0 animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                <DocumentCard
                  document={doc}
                  onViewDetails={() => window.location.href = `/agent/documents/${doc.id}`}
                  onDownload={() => window.open(doc.cloudinary_url, '_blank')}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}