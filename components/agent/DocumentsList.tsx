// components/agent/DocumentsList.tsx
'use client'

import { useState, useEffect } from 'react'
import { useMyDocuments, useDeleteDocument } from '@/hooks/useAgent'
import { Upload, FileText, Users, Building, FileSpreadsheet, TrendingUp } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import DocumentCard from './DocumentCard'
import { useRouter } from 'next/navigation'

export default function DocumentsList() {
  const router = useRouter()
  const { data: documents = [], isLoading, error } = useMyDocuments()
  const deleteMutation = useDeleteDocument()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
          {/* Enhanced Header */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gray-800/60 border border-gray-700/50">
                      <FileText size={24} className="text-gray-300" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                        Documents
                      </h1>
                      <p className="text-gray-400 text-sm md:text-base">
                        {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded • Source files for your audience
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/agent/documents/upload')}
                  className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Upload size={18} /> 
                  Upload Document
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Bar */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            {[
              { icon: FileText, label: 'Documents', value: documents.length, color: 'blue-400', delay: '0ms' },
              { icon: Building, label: 'Properties Extracted', value: totalProperties, color: 'purple-400', delay: '50ms' },
              { icon: Users, label: 'Contacts Extracted', value: totalContacts, color: 'emerald-400', delay: '100ms' },
              { icon: TrendingUp, label: 'With Audience', value: docsWithAudience, color: 'orange-400', delay: '150ms' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-2 border-gray-800/50 rounded-xl p-5 backdrop-blur-sm shadow-xl hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 ${
                  isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: stat.delay }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 bg-gray-800/60 border border-gray-700/50 rounded-lg`}>
                    <stat.icon className={`size-5 text-${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Banner for CSV */}
          <div
            className={`bg-blue-900/20 border-2 border-blue-800/30 rounded-xl p-5 mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <FileSpreadsheet className="size-5 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-300 font-semibold mb-1">CSV files are best for bulk import</p>
                <p className="text-blue-400/70 text-sm">
                  Include columns: <code className="bg-blue-900/30 px-1.5 py-0.5 rounded">address</code>, 
                  <code className="bg-blue-900/30 px-1.5 py-0.5 rounded mx-1">owner_name</code>, 
                  <code className="bg-blue-900/30 px-1.5 py-0.5 rounded mx-1">owner_phone</code>, 
                  <code className="bg-blue-900/30 px-1.5 py-0.5 rounded mx-1">city</code>, 
                  <code className="bg-blue-900/30 px-1.5 py-0.5 rounded mx-1">property_type</code>, 
                  <code className="bg-blue-900/30 px-1.5 py-0.5 rounded">price</code>
                </p>
              </div>
            </div>
          </div>

          {/* Documents Grid with Staggered Animation */}
          {isLoading ? (
            <LoadingSpinner />
          ) : documents.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-2 border-gray-800/50 rounded-2xl backdrop-blur-sm">
              <FileText className="size-20 text-gray-700 mx-auto mb-6" />
              <h3 className="text-xl text-gray-400 font-medium mb-2">No documents uploaded yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Upload a CSV, PDF, or DOCX file to import your target audience for calling campaigns
              </p>
              <button
                onClick={() => router.push('/agent/documents/upload')}
                className="inline-flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
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
                  className={`transition-all duration-700 ease-out ${
                    isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${Math.min(i * 100, 1000)}ms`,
                    animation: isMounted ? `fadeInUp 0.7s ease-out ${Math.min(i * 100, 1000)}ms both` : 'none'
                  }}
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
