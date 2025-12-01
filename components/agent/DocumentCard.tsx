// components/agent/DocumentCard.tsx
'use client'

import { FileText, Download, Eye, Trash2, Users, Building, FileSpreadsheet, FileType } from 'lucide-react'

interface DocumentCardProps {
  document: {
    id: string
    file_name: string
    file_type: string
    file_size: string | null
    properties_count?: number
    contacts_count?: number
    created_at: string
    cloudinary_url?: string
  }
  onViewDetails: (id: string) => void
  onDownload: (url: string) => void
  onDelete: (id: string) => void
}

export default function DocumentCard({ document, onViewDetails, onDownload, onDelete }: DocumentCardProps) {
  const getFileIcon = () => {
    switch (document.file_type.toLowerCase()) {
      case 'pdf':
        return <FileText className="size-8 text-red-400" />
      case 'csv':
        return <FileSpreadsheet className="size-8 text-green-400" />
      case 'docx':
        return <FileType className="size-8 text-blue-400" />
      default:
        return <FileText className="size-8 text-gray-400" />
    }
  }

  const hasAudience = (document.properties_count || 0) > 0 || (document.contacts_count || 0) > 0

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-gray-800 rounded-lg shrink-0">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate" title={document.file_name}>
            {document.file_name}
          </p>
          <p className="text-sm text-gray-500">
            {document.file_size || '—'} • {document.file_type.toUpperCase()}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {new Date(document.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Audience Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Building className="size-4 text-blue-400" />
            <span className="text-xs text-gray-400">Properties</span>
          </div>
          <p className="text-xl font-bold text-white">{document.properties_count || 0}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Users className="size-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Contacts</span>
          </div>
          <p className="text-xl font-bold text-white">{document.contacts_count || 0}</p>
        </div>
      </div>

      {/* Status Badge */}
      {hasAudience && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-medium rounded-full border border-emerald-800/50">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Ready for calling
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={() => onViewDetails(document.id)} 
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-all"
        >
          <Eye className="size-4" /> View
        </button>
        <button 
          onClick={() => onDownload(document.cloudinary_url || '')} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-all"
        >
          <Download className="size-4" />
        </button>
        <button 
          onClick={() => onDelete(document.id)} 
          className="flex items-center justify-center px-3 py-2.5 border border-red-900/50 hover:border-red-800 rounded-lg transition-all group"
        >
          <Trash2 className="size-4 text-red-400 group-hover:text-red-300" />
        </button>
      </div>
    </div>
  )
}
