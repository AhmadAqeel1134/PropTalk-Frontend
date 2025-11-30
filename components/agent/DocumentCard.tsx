// components/agent/DocumentCard.tsx
import { FileText, Download, Eye, Trash2 } from 'lucide-react'

interface DocumentCardProps {
  document: {
    id: string
    file_name: string
    file_type: string
    file_size: string | null
    created_at: string
    cloudinary_url?: string
  }
  onViewDetails: (id: string) => void
  onDownload: (url: string) => void
  onDelete: (id: string) => void
}

export default function DocumentCard({ document, onViewDetails, onDownload, onDelete }: DocumentCardProps) {
  const iconMap: Record<string, any> = {
    pdf: FileText,
    csv: FileText,
    docx: FileText,
  }

  const Icon = iconMap[document.file_type] || FileText

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-gray-800 rounded-lg">
          <Icon className="size-8 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium line-clamp-2">{document.file_name}</p>
          <p className="text-sm text-gray-500">{document.file_size || '—'} • {document.file_type.toUpperCase()}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onViewDetails(document.id)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm">
          <Eye className="size-4" /> View
        </button>
        <button onClick={() => onDownload(document.cloudinary_url || '')} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm">
          <Download className="size-4" /> Download
        </button>
        <button onClick={() => onDelete(document.id)} className="p-2 border border-red-800 hover:border-red-700 rounded-lg">
          <Trash2 className="size-4 text-red-400" />
        </button>
      </div>
    </div>
  )
}