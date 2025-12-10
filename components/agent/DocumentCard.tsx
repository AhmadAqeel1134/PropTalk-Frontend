// components/agent/DocumentCard.tsx
'use client'

import { FileText, Download, Eye, Trash2, Users, Building, FileSpreadsheet, FileType } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

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
  const { theme } = useTheme()
  
  const getFileIcon = () => {
    switch (document.file_type.toLowerCase()) {
      case 'pdf':
        return <FileText className={`size-8 ${
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        }`} />
      case 'csv':
        return <FileSpreadsheet className={`size-8 ${
          theme === 'dark' ? 'text-green-400' : 'text-green-600'
        }`} />
      case 'docx':
        return <FileType className={`size-8 ${
          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
        }`} />
      default:
        return <FileText className={`size-8 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`} />
    }
  }

  const hasAudience = (document.properties_count || 0) > 0 || (document.contacts_count || 0) > 0

  return (
    <div
      className={`group relative border-2 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900/90 to-gray-950/90 border-gray-800/50 hover:border-gray-600 hover:shadow-2xl hover:shadow-black/40'
          : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl shadow-sm'
      }`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200'
      }`} />
      
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div
          className={`p-3.5 border rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800/60 border-gray-700/50'
              : 'bg-gray-100 border-gray-200'
          }`}
        >
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`font-bold text-sm mb-1 truncate ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
            title={document.file_name}
          >
            {document.file_name}
          </p>
          <div className={`flex items-center gap-2 text-xs mb-1 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <span>{document.file_size || '—'}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 border rounded font-medium ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700/50 text-gray-400'
                : 'bg-gray-100 border-gray-200 text-gray-600'
            }`}>
              {document.file_type.toUpperCase()}
            </span>
          </div>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-500'
          }`}>
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
        <div
          className={`rounded-xl p-3.5 border ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50'
              : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-1.5 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200'
              }`}
            >
              <Building className={`size-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
            <span className={`text-xs font-medium ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Properties
            </span>
          </div>
          <p className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {document.properties_count || 0}
          </p>
        </div>
        <div
          className={`rounded-xl p-3.5 border ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50'
              : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-1.5 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200'
              }`}
            >
              <Users className={`size-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
            <span className={`text-xs font-medium ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Contacts
            </span>
          </div>
          <p className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {document.contacts_count || 0}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      {hasAudience && (
        <div className="mb-5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-lg ${
              theme === 'dark'
                ? 'bg-emerald-900/30 border-emerald-800/50 text-emerald-400'
                : 'bg-emerald-100 border-emerald-300 text-emerald-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-600'
              }`}
            />
            Ready for calling
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(document.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white'
              : 'bg-white border-gray-200 hover:border-blue-400 text-gray-600 hover:text-blue-700 shadow-sm'
          }`}
        >
          <Eye className="size-4" /> View
        </button>
        <button
          onClick={() => onDownload(document.cloudinary_url || '')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            theme === 'dark'
              ? 'border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white'
              : 'border-gray-200 hover:border-blue-400 text-gray-600 hover:text-blue-700 shadow-sm'
          }`}
        >
          <Download className="size-4" />
        </button>
        <button
          onClick={() => onDelete(document.id)}
          className={`flex items-center justify-center px-3 py-2.5 border-2 rounded-xl transition-all duration-300 group/delete ${
            theme === 'dark'
              ? 'border-red-900/50 hover:border-red-800 hover:bg-red-900/20'
              : 'border-red-200 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Trash2
            className={`size-4 group-hover/delete:${
              theme === 'dark' ? 'text-red-300' : 'text-red-700'
            } ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
