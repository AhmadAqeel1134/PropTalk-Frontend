'use client'

import { useState, useEffect, useRef } from 'react'
import { useUploadDocument } from '@/hooks/useAgent'
import { X, Upload, FileText, File, FileSpreadsheet, FileType, CheckCircle } from 'lucide-react'

export default function UploadDocumentForm({ onClose }: { onClose: () => void }) {
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
        const lines = text.split('\n').slice(0, 10) // Preview first 10 rows
        const rows = lines.map(line => line.split(',').map(cell => cell.trim()))
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
        onSuccess: () => onClose(),
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
    if (ext === 'pdf') return <FileText className="size-8 text-red-400" />
    if (ext === 'csv') return <FileSpreadsheet className="size-8 text-green-400" />
    if (ext === 'docx') return <FileType className="size-8 text-blue-400" />
    return <File className="size-8 text-gray-400" />
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4"
      style={{
        animation: 'fade-in 0.3s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          animation: isMounted ? 'slide-in-from-bottom-4 0.4s ease-out' : 'none',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Upload Document</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - File Upload */}
            <div className="space-y-6">
              <div style={{ animationDelay: '0.1s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="inline size-4 mr-2" />
                  Document (CSV, PDF, DOCX)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-600 transition-colors bg-gray-800/50"
                >
                  {file ? (
                    <div className="space-y-3">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="size-12 text-gray-500 mx-auto" />
                      <div>
                        <p className="text-gray-300 font-medium">Click to select file</p>
                        <p className="text-sm text-gray-500 mt-1">CSV, PDF, or DOCX</p>
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

              <div style={{ animationDelay: '0.2s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors resize-none"
                  placeholder="Add a description for this document..."
                />
              </div>
            </div>

            {/* Right Column - Preview */}
            <div style={{ animationDelay: '0.15s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preview
              </label>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-h-[500px] overflow-auto min-h-[400px]">
                {!file ? (
                  <div className="flex items-center justify-center min-h-[400px] text-gray-500">
                    <div className="text-center">
                      <FileText className="size-16 mx-auto mb-4 opacity-50" />
                      <p>Select a file to see preview</p>
                    </div>
                  </div>
                ) : file.name.endsWith('.pdf') && preview ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="size-5" />
                      <span className="text-sm font-medium">PDF Preview</span>
                    </div>
                    <iframe
                      src={preview}
                      className="w-full h-[500px] border border-gray-700 rounded"
                      title="PDF Preview"
                    />
                  </div>
                ) : file.name.endsWith('.csv') && csvPreview.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="size-5" />
                      <span className="text-sm font-medium">CSV Preview (first 10 rows)</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-gray-700">
                            {csvPreview[0]?.map((_, idx) => (
                              <th key={idx} className="px-3 py-2 text-gray-400 font-medium">
                                Column {idx + 1}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-gray-800">
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-3 py-2 text-gray-300">
                                  {cell || '-'}
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
                    <div className="text-center">
                      <FileType className="size-16 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm mt-2">{formatFileSize(file.size)}</p>
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

          <div className="flex gap-4 pt-4 animate-[slide-in-from-bottom-2_0.5s_ease-out]" style={{ animationDelay: '0.3s' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending || !file}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="size-5" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

