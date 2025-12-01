'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUploadDocument } from '@/hooks/useAgent'
import { X, Upload, FileText, File, FileSpreadsheet, FileType, CheckCircle, Users, Building } from 'lucide-react'

interface UploadDocumentFormProps {
  onClose: () => void
}

export default function UploadDocumentForm({ onClose }: UploadDocumentFormProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [csvPreview, setCsvPreview] = useState<string[][]>([])
  const [isMounted, setIsMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadDocument()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!file) {
      setPreview(null)
      setCsvPreview([])
      return
    }

    const fileType = file.name.split('.').pop()?.toLowerCase()

    if (fileType === 'pdf') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else if (fileType === 'csv') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        
        // Detect delimiter (same logic as backend)
        const firstLine = text.split('\n')[0]
        const tabCount = (firstLine.match(/\t/g) || []).length
        const commaCount = (firstLine.match(/,/g) || []).length
        const delimiter = tabCount > commaCount ? '\t' : ','
        
        // Parse CSV properly (handles quoted fields with delimiters inside)
        const lines = text.split('\n').slice(0, 11) // Header + 10 rows
        const rows: string[][] = []
        
        for (const line of lines) {
          if (!line.trim()) continue
          
          const cells: string[] = []
          let currentCell = ''
          let insideQuotes = false
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i]
            const nextChar = line[i + 1]
            
            if (char === '"') {
              if (insideQuotes && nextChar === '"') {
                // Escaped quote
                currentCell += '"'
                i++ // Skip next quote
              } else {
                // Toggle quote state
                insideQuotes = !insideQuotes
              }
            } else if (char === delimiter && !insideQuotes) {
              // End of cell
              cells.push(currentCell.trim())
              currentCell = ''
            } else {
              currentCell += char
            }
          }
          
          // Add last cell
          cells.push(currentCell.trim())
          rows.push(cells)
        }
        
        setCsvPreview(rows)
      }
      reader.readAsText(file)
    } else {
      setPreview(null)
      setCsvPreview([])
    }
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    uploadMutation.mutate(
      { file, description: description || undefined },
      {
        onSuccess: (data) => {
          // Redirect to document details to show extracted audience
          if (data?.id) {
            router.push(`/agent/documents/${data.id}`)
          } else {
            router.push('/agent/documents')
          }
        },
      }
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return <FileText className="size-10 text-red-400" />
    if (ext === 'csv') return <FileSpreadsheet className="size-10 text-green-400" />
    if (ext === 'docx') return <FileType className="size-10 text-blue-400" />
    return <File className="size-10 text-gray-400" />
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4"
      style={{ animation: 'fade-in 0.3s ease-out' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ animation: isMounted ? 'slide-in-from-bottom-4 0.4s ease-out' : 'none' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Upload Document</h2>
            <p className="text-gray-400 mt-1">Upload CSV, PDF, or DOCX to import your target audience</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <FileSpreadsheet className="size-5 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-300 font-medium">CSV files are recommended</p>
              <p className="text-blue-400/70 text-sm mt-1">
                CSV files will automatically extract properties and contacts for your calling campaigns.
                Include columns: address, city, state, owner_name, owner_phone, owner_email, property_type, price, etc.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - File Upload */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Document
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    file 
                      ? 'border-green-700 bg-green-900/10' 
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50'
                  }`}
                >
                  {file ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">{getFileIcon(file.name)}</div>
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-sm text-gray-400 mt-1">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        className="text-sm text-red-400 hover:text-red-300 font-medium"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
                        <Upload className="size-8 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-gray-300 font-medium">Click to select file</p>
                        <p className="text-sm text-gray-500 mt-1">CSV, PDF, or DOCX up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors resize-none"
                  placeholder="e.g., Lahore residential properties Q4 2024..."
                />
              </div>

              {/* What happens next */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-sm text-gray-400 font-medium mb-3">After upload:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Building className="size-4 text-blue-400" />
                    <span>Properties will be extracted automatically</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="size-4 text-emerald-400" />
                    <span>Contacts will be created and deduplicated</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="size-4 text-purple-400" />
                    <span>Ready to start calling campaigns</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Preview
              </label>
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden min-h-[400px] max-h-[500px]">
                {!file ? (
                  <div className="flex items-center justify-center min-h-[400px] text-gray-500">
                    <div className="text-center p-8">
                      <FileText className="size-16 mx-auto mb-4 opacity-30" />
                      <p className="text-gray-500">Select a file to see preview</p>
                    </div>
                  </div>
                ) : file.name.endsWith('.pdf') && preview ? (
                  <div className="h-full">
                    <div className="flex items-center gap-2 text-green-400 p-4 border-b border-gray-700">
                      <CheckCircle className="size-5" />
                      <span className="text-sm font-medium">PDF Preview</span>
                    </div>
                    <iframe
                      src={preview}
                      className="w-full h-[450px]"
                      title="PDF Preview"
                    />
                  </div>
                ) : file.name.endsWith('.csv') && csvPreview.length > 0 ? (
                  <div className="h-full overflow-auto">
                    <div className="flex items-center gap-2 text-green-400 p-4 border-b border-gray-700 sticky top-0 bg-gray-800">
                      <CheckCircle className="size-5" />
                      <span className="text-sm font-medium">CSV Preview (first 10 rows)</span>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-gray-700">
                            {csvPreview[0]?.map((header, idx) => (
                              <th key={idx} className="px-3 py-2 text-gray-400 font-medium whitespace-nowrap">
                                {header || `Col ${idx + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.slice(1).map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-gray-800">
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-3 py-2 text-gray-300 whitespace-nowrap">
                                  {cell || '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : file.name.endsWith('.docx') ? (
                  <div className="flex items-center justify-center min-h-[400px] text-gray-500">
                    <div className="text-center p-8">
                      <FileType className="size-16 mx-auto mb-4 text-blue-400 opacity-50" />
                      <p className="font-medium text-gray-300">{file.name}</p>
                      <p className="text-sm mt-2 text-gray-500">{formatFileSize(file.size)}</p>
                      <p className="text-xs mt-4 text-gray-600">DOCX preview not available</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[400px] text-gray-500">
                    <p>Preview not available for this file type</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending || !file}
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="size-5" />
                  Upload & Extract Audience
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
