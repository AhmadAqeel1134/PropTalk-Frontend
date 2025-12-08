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
    <div className="group relative bg-gradient-to-br from-gray-900/90 to-gray-950/90 border-2 border-gray-800/50 rounded-2xl p-6 hover:border-gray-600 transition-all duration-500 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-700/50" />
      
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="p-3.5 bg-gray-800/60 border border-gray-700/50 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm mb-1 truncate" title={document.file_name}>
            {document.file_name}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>{document.file_size || '—'}</span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded text-gray-400 font-medium">
              {document.file_type.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {new Date(document.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Audience Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-3.5 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gray-700/50 rounded-lg">
              <Building className="size-4 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Properties</span>
          </div>
          <p className="text-2xl font-bold text-white">{document.properties_count || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-3.5 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gray-700/50 rounded-lg">
              <Users className="size-4 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Contacts</span>
          </div>
          <p className="text-2xl font-bold text-white">{document.contacts_count || 0}</p>
        </div>
      </div>

      {/* Status Badge */}
      {hasAudience && (
        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 text-xs font-semibold rounded-lg">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Ready for calling
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={() => onViewDetails(document.id)} 
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-800/60 border-2 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all duration-300"
        >
          <Eye className="size-4" /> View
        </button>
        <button 
          onClick={() => onDownload(document.cloudinary_url || '')} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all duration-300"
        >
          <Download className="size-4" />
        </button>
        <button 
          onClick={() => onDelete(document.id)} 
          className="flex items-center justify-center px-3 py-2.5 border-2 border-red-900/50 hover:border-red-800 rounded-xl transition-all duration-300 hover:bg-red-900/20 group/delete"
        >
          <Trash2 className="size-4 text-red-400 group-hover/delete:text-red-300" />
        </button>
      </div>
    </div>
  )
}
