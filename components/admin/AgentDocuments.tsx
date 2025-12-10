'use client';

import React, { useState, useMemo } from 'react';
import { useAgentDocuments } from '@/hooks/useAdmin';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  RefreshCw,
  File,
  FileType,
} from 'lucide-react';

interface AgentDocumentsProps {
  agentId: string;
  agentName?: string;
  onBack?: () => void;
}

const AgentDocuments: React.FC<AgentDocumentsProps> = ({ agentId, agentName, onBack }) => {
  const { data: documents, isLoading, error, refetch } = useAgentDocuments(agentId);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Get unique file types for filter
  const fileTypes = useMemo(() => {
    if (!documents) return [];
    const types = new Set(documents.map(d => d.file_type).filter(Boolean));
    return Array.from(types);
  }, [documents]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return documents.filter((doc) => {
      const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.file_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, typeFilter]);

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText size={24} className="text-red-400" />;
      case 'csv':
        return <FileType size={24} className="text-green-400" />;
      case 'docx':
        return <File size={24} className="text-blue-400" />;
      default:
        return <File size={24} className="text-blue-400" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading documents..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message || 'Failed to load documents'}
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background: 'rgba(10, 15, 25, 0.95)',
      }}
    >
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <div className="flex justify-end mb-4">
              <button
                onClick={onBack}
                className="px-5 py-2.5 bg-gray-800/60 border-2 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-200"
              >
                Back
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-5xl md:text-6xl font-bold text-white mb-4"
                style={{
                  textShadow: '0 0 30px rgba(77, 184, 255, 0.4)',
                }}
              >
                Documents
              </h1>
              <p className="text-2xl text-blue-300">
                {agentName && `${agentName} • `}
                {filteredDocuments.length} {filteredDocuments.length === 1 ? 'Document' : 'Documents'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="p-3 rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                background: 'rgba(59, 158, 255, 0.1)',
                border: '1px solid rgba(77, 184, 255, 0.3)',
              }}
            >
              <RefreshCw size={20} className="text-blue-400" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div
          className="mb-8 rounded-2xl p-6 backdrop-blur-sm"
          style={{
            background: 'rgba(15, 31, 58, 0.7)',
            border: '1px solid rgba(77, 184, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by file name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-blue-300 transition-all duration-300 focus:outline-none"
                  style={{
                    background: 'rgba(10, 22, 40, 0.6)',
                    border: '1px solid rgba(77, 184, 255, 0.3)',
                  }}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 rounded-lg text-white transition-all duration-300 focus:outline-none cursor-pointer"
                style={{
                  background: 'rgba(10, 22, 40, 0.6)',
                  border: '1px solid rgba(77, 184, 255, 0.3)',
                }}
              >
                <option value="all">All Types</option>
                {fileTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div
            className="rounded-2xl p-12 backdrop-blur-sm text-center"
            style={{
              background: 'rgba(15, 31, 58, 0.7)',
              border: '1px solid rgba(77, 184, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <FileText size={48} className="text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Documents Found</h3>
            <p className="text-blue-200">
              {documents?.length === 0
                ? 'This agent has not uploaded any documents yet'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgba(15, 31, 58, 0.7)',
                  border: '1px solid rgba(77, 184, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  {getFileIcon(doc.file_type)}
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-purple-400"
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    {doc.file_type.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 truncate">{doc.file_name}</h3>

                {doc.description && (
                  <p className="text-sm text-blue-200 mb-4 line-clamp-2">{doc.description}</p>
                )}

                <div className="flex items-center space-x-4 mb-4 text-xs text-blue-300">
                  {doc.file_size && <span>{doc.file_size}</span>}
                  <span className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </span>
                </div>

                <a
                  href={doc.cloudinary_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)',
                    boxShadow: '0 4px 15px rgba(59, 158, 255, 0.4)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={16} />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDocuments;

