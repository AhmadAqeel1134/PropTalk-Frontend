// components/agent/DocumentsList.tsx
'use client'

import { useMyDocuments, useDeleteDocument } from '@/hooks/useAgent'
import { Upload, FileText, Users, Building, FileSpreadsheet } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import DocumentCard from './DocumentCard'
import { useRouter } from 'next/navigation'

export default function DocumentsList() {
  const router = useRouter()
  const { data: documents = [], isLoading, error } = useMyDocuments()
  const deleteMutation = useDeleteDocument()

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document? All properties extracted from it will also be deleted.')) {
      deleteMutation.mutate(id)
    }
  }

  // Calculate totals
  const totalProperties = documents.reduce((sum, doc) => sum + (doc.properties_count || 0), 0)
  const totalContacts = documents.reduce((sum, doc) => sum + (doc.contacts_count || 0), 0)
  const docsWithAudience = documents.filter(d => (d.properties_count || 0) > 0 || (d.contacts_count || 0) > 0).length

  if (error) return <ErrorMessage message={(error as Error).message} />

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-full">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Documents</h1>
              <p className="text-gray-400 mt-1">
                {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded • Source files for your audience
              </p>
            </div>
            <button
              onClick={() => router.push('/agent/documents/upload')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-5 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
            >
              <Upload className="size-5" /> 
              Upload Document
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <FileText className="size-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{documents.length}</p>
                  <p className="text-xs text-gray-500">Documents</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Building className="size-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalProperties}</p>
                  <p className="text-xs text-gray-500">Properties Extracted</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Users className="size-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalContacts}</p>
                  <p className="text-xs text-gray-500">Contacts Extracted</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <FileSpreadsheet className="size-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{docsWithAudience}</p>
                  <p className="text-xs text-gray-500">With Audience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner for CSV */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <FileSpreadsheet className="size-5 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-300 font-medium">CSV files are best for bulk import</p>
                <p className="text-blue-400/70 text-sm mt-1">
                  Include columns: <code className="bg-blue-900/30 px-1 rounded">address</code>, 
                  <code className="bg-blue-900/30 px-1 rounded mx-1">owner_name</code>, 
                  <code className="bg-blue-900/30 px-1 rounded mx-1">owner_phone</code>, 
                  <code className="bg-blue-900/30 px-1 rounded mx-1">city</code>, 
                  <code className="bg-blue-900/30 px-1 rounded mx-1">property_type</code>, 
                  <code className="bg-blue-900/30 px-1 rounded">price</code>
                </p>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          {isLoading ? (
            <LoadingSpinner />
          ) : documents.length === 0 ? (
            <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-xl">
              <FileText className="size-20 text-gray-700 mx-auto mb-6" />
              <h3 className="text-xl text-gray-400 font-medium mb-2">No documents uploaded yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Upload a CSV, PDF, or DOCX file to import your target audience for calling campaigns
              </p>
              <button
                onClick={() => router.push('/agent/documents/upload')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                <Upload className="size-5" />
                Upload Your First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {documents.map((doc, i) => (
                <div 
                  key={doc.id} 
                  className="opacity-0 animate-fadeIn" 
                  style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
                >
                  <DocumentCard
                    document={doc}
                    onViewDetails={() => router.push(`/agent/documents/${doc.id}`)}
                    onDownload={() => window.open(doc.cloudinary_url, '_blank')}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
