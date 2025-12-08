'use client';

import React, { useState } from 'react';
import { useAgentDetails, useAgentDocumentsPaginated, useAgentPropertiesPaginated } from '@/hooks/useAdmin';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import PageTransition from '@/components/common/PageTransition';
import {
  User,
  Building,
  FileText,
  Contact,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Home,
  Bed,
  Bath,
  DollarSign,
  Search,
  Grid3x3,
  List,
  Maximize2,
} from 'lucide-react';

interface AgentFullDetailsProps {
  agentId: string;
  onBack?: () => void;
}

type TabType = 'info' | 'properties' | 'documents' | 'contacts' | 'phone';

const AgentFullDetails: React.FC<AgentFullDetailsProps> = ({ agentId, onBack }) => {
  const { data, isLoading, error, refetch } = useAgentDetails(agentId);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [documentsPage, setDocumentsPage] = useState(1);
  const documentsPageSize = 16;
  const [propertiesPage, setPropertiesPage] = useState(1);
  const propertiesPageSize = 16;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: paginatedDocuments, isLoading: documentsLoading } = useAgentDocumentsPaginated(
    agentId,
    documentsPage,
    documentsPageSize
  );
  
  const { data: paginatedProperties, isLoading: propertiesLoading } = useAgentPropertiesPaginated(
    agentId,
    propertiesPage,
    propertiesPageSize
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== 'documents') {
      setDocumentsPage(1);
    }
    if (tab !== 'properties') {
      setPropertiesPage(1);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading agent details..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message || 'Failed to load agent details'}
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  if (!data) {
    return <ErrorMessage message="Agent not found" fullScreen />;
  }

  const { agent, properties, documents, phone_number, contacts } = data;
  
  const documentsCount = paginatedDocuments?.total ?? documents.length;
  const propertiesCount = paginatedProperties?.total ?? properties.length;

  const totalPropertyValue = properties.reduce((sum, prop) => {
    const price = parseFloat(prop.price || '0');
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const formatPrice = (price: string | null) => {
    if (!price) return 'N/A';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    return formatPrice(num.toString());
  };

  const tabs = [
    { id: 'info' as TabType, label: 'Overview', icon: User, count: null },
    { id: 'properties' as TabType, label: 'Properties', icon: Building, count: propertiesCount },
    { id: 'documents' as TabType, label: 'Documents', icon: FileText, count: documentsCount },
    { id: 'contacts' as TabType, label: 'Contacts', icon: Contact, count: contacts.length },
    { id: 'phone' as TabType, label: 'Phone', icon: Phone, count: null },
  ];

  const filteredProperties = (paginatedProperties?.items ?? []).filter(prop => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      prop.address?.toLowerCase().includes(query) ||
      prop.property_type?.toLowerCase().includes(query) ||
      prop.city?.toLowerCase().includes(query)
    );
  });

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="w-full px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-end mb-6">
              <button
                onClick={handleBack}
                className="px-5 py-2.5 bg-gray-800/60 border-2 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-200"
              >
                Back
              </button>
            </div>

            {/* Profile Section */}
            <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-800 opacity-0" style={{ animation: 'fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 100ms forwards' }}>
              <div className="relative">
                <div className="w-16 h-16 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                  <User size={32} className="text-gray-400" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                  agent.is_active ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">
                    {agent.full_name}
                  </h1>
                  {agent.is_verified && (
                    <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-xs font-medium flex items-center gap-1.5">
                      <CheckCircle size={12} />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mb-3">{agent.company_name || 'Independent Real Estate Agent'}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} />
                    {agent.email}
                  </span>
                  {agent.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} />
                      {agent.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{propertiesCount}</div>
                  <div className="text-xs text-gray-500">Properties</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{formatLargeNumber(totalPropertyValue)}</div>
                  <div className="text-xs text-gray-500">Total Value</div>
                </div>
                <button
                  onClick={() => refetch()}
                  className="p-2.5 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw size={18} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-gray-800">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-500 ease-out ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={{
                      animation: `fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms forwards`
                    }}
                  >
                    <Icon size={18} className={`transition-transform duration-500 ${isActive ? 'scale-110' : ''}`} />
                    <span>{tab.label}</span>
                    {tab.count !== null && tab.count !== undefined && (
                      <span className={`ml-1.5 px-2 py-0.5 rounded text-xs transition-all duration-500 ${
                        isActive ? 'bg-gray-800 text-white scale-110' : 'bg-gray-900 text-gray-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-500"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div key={activeTab} className="opacity-0" style={{ animation: 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards' }}>
            {activeTab === 'info' && <AgentInfo agent={agent} />}
            {activeTab === 'properties' && (
              <PropertiesTab
                properties={filteredProperties}
                total={paginatedProperties?.total ?? 0}
                page={propertiesPage}
                pageSize={propertiesPageSize}
                isLoading={propertiesLoading}
                onPageChange={setPropertiesPage}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                formatPrice={formatPrice}
              />
            )}
            {activeTab === 'documents' && (
              <DocumentsTab
                documents={paginatedDocuments?.items ?? []}
                total={paginatedDocuments?.total ?? 0}
                page={documentsPage}
                pageSize={documentsPageSize}
                isLoading={documentsLoading}
                onPageChange={setDocumentsPage}
              />
            )}
            {activeTab === 'contacts' && <ContactsTab contacts={contacts} />}
            {activeTab === 'phone' && <PhoneTab phoneNumber={phone_number} />}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

// Agent Info Tab Component
const AgentInfo: React.FC<{ agent: any }> = ({ agent }) => {
  const infoSections = [
    {
      title: 'Contact Information',
      items: [
        { icon: Mail, label: 'Email', value: agent.email },
        { icon: Phone, label: 'Phone', value: agent.phone || 'Not provided' },
        { icon: MapPin, label: 'Address', value: agent.address || 'Not provided' },
      ],
    },
    {
      title: 'Company Details',
      items: [
        { icon: Building, label: 'Company Name', value: agent.company_name || 'Independent Agent' },
      ],
    },
    {
      title: 'Account Information',
      items: [
        { icon: Calendar, label: 'Member Since', value: new Date(agent.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
        { icon: Calendar, label: 'Last Updated', value: new Date(agent.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {infoSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {section.items.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/50 border-2 border-gray-800 hover:border-gray-500 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out opacity-0"
                  style={{
                    animation: `fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${(sectionIndex * 150) + (index * 100)}ms forwards`
                  }}
                >
                  <div className="p-2 rounded bg-gray-800 border border-gray-700">
                    <Icon size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {item.label}
                    </div>
                    <div className="text-white font-medium break-words">
                      {item.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Properties Tab Component
interface PropertiesTabProps {
  properties: any[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  formatPrice: (price: string | null) => string;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({
  properties,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  formatPrice,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <LoadingSpinner text="Loading properties..." />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <Building size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Properties Listed</h3>
        <p className="text-gray-500">This agent hasn't added any properties yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-700 transition-colors text-sm"
          />
        </div>

        <div className="flex gap-2 p-1 bg-gray-900/50 border border-gray-800 rounded-lg">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Grid3x3 size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total.toString(), icon: Building },
          { label: 'Available', value: properties.filter(p => p.is_available === 'yes' || p.is_available === 'true').length.toString(), icon: CheckCircle },
          { label: 'Types', value: new Set(properties.map(p => p.property_type).filter(Boolean)).size.toString(), icon: Home },
          { label: 'Avg. Price', value: properties.length > 0 ? formatPrice((properties.reduce((sum, p) => sum + (parseFloat(p.price || '0') || 0), 0) / properties.length).toString()) : 'N/A', icon: DollarSign },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="p-4 rounded-lg bg-gray-900/50 border-2 border-gray-800 hover:border-gray-500 hover:scale-[1.05] hover:-translate-y-1 transition-all duration-500 ease-out opacity-0"
              style={{
                animation: `fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${i * 120}ms forwards`
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-gray-500" />
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <div className="text-xl font-semibold text-white">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Properties Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="p-5 rounded-lg bg-gray-900/50 border-2 border-gray-800 hover:border-gray-500 hover:scale-[1.03] hover:-translate-y-2 transition-all duration-500 ease-out opacity-0"
              style={{
                animation: `fadeInUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms forwards`
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white mb-1 truncate">
                    {property.address}
                  </h3>
                  <p className="text-xs text-gray-500">{property.city || 'N/A'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  property.is_available === 'yes' || property.is_available === 'true'
                    ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                    : 'text-red-400 bg-red-500/10 border border-red-500/20'
                }`}>
                  {property.is_available === 'yes' || property.is_available === 'true' ? 'Available' : 'Unavailable'}
                </span>
              </div>

              {(property.bedrooms || property.bathrooms || property.square_feet) && (
                <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-800">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Bed size={14} />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Bath size={14} />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.square_feet && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Maximize2 size={14} />
                      <span>{property.square_feet} sqft</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-lg font-bold text-white">
                  {formatPrice(property.price)}
                </div>
                <div className="text-xs text-gray-500 mt-1">{property.property_type || 'Property'}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="p-4 rounded-lg bg-gray-900/50 border-2 border-gray-800 hover:border-gray-500 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out opacity-0"
              style={{
                animation: `fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms forwards`
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white mb-1">
                    {property.address}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{property.property_type || 'N/A'}</span>
                    {property.bedrooms > 0 && <span>{property.bedrooms} beds</span>}
                    {property.bathrooms > 0 && <span>{property.bathrooms} baths</span>}
                    {property.city && <span>{property.city}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white mb-1">
                    {formatPrice(property.price)}
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    property.is_available === 'yes' || property.is_available === 'true'
                      ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                      : 'text-red-400 bg-red-500/10 border border-red-500/20'
                  }`}>
                    {property.is_available === 'yes' || property.is_available === 'true' ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-800">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === 1
                ? 'text-gray-600 bg-gray-900 border border-gray-800 cursor-not-allowed'
                : 'text-white bg-gray-900 border border-gray-800 hover:bg-gray-800'
            }`}
          >
            <ChevronLeft size={16} className="inline" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'text-white bg-gray-800 border border-gray-700'
                      : 'text-gray-400 bg-gray-900 border border-gray-800 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === totalPages
                ? 'text-gray-600 bg-gray-900 border border-gray-800 cursor-not-allowed'
                : 'text-white bg-gray-900 border border-gray-800 hover:bg-gray-800'
            }`}
          >
            <ChevronRight size={16} className="inline" />
          </button>
        </div>
      )}
    </div>
  );
};

// Documents Tab Component
interface DocumentsTabProps {
  documents: any[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ documents, total, page, pageSize, isLoading, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <LoadingSpinner text="Loading documents..." />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Documents</h3>
        <p className="text-gray-500">This agent hasn't uploaded any documents yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Document Library</h2>
        <p className="text-sm text-gray-500">
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total} documents
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className="p-4 rounded-lg bg-gray-900/50 border-2 border-gray-800 hover:border-gray-500 hover:scale-[1.03] hover:-translate-y-2 transition-all duration-500 ease-out opacity-0"
            style={{
              animation: `fadeInUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms forwards`
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded bg-gray-800 border border-gray-700">
                <FileText size={18} className="text-gray-400" />
              </div>
              <span className="px-2 py-1 rounded text-xs font-medium text-gray-300 bg-gray-800 border border-gray-700 uppercase">
                {doc.file_type}
              </span>
            </div>
            <h4 className="text-white font-medium mb-2 truncate">{doc.file_name}</h4>
            <p className="text-xs text-gray-500 mb-3">
              {doc.file_size || 'Size unknown'} • {new Date(doc.created_at).toLocaleDateString()}
            </p>
            <a
              href={doc.cloudinary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <Download size={14} />
              <span>Download</span>
            </a>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-800">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === 1
                ? 'text-gray-600 bg-gray-900 border border-gray-800 cursor-not-allowed'
                : 'text-white bg-gray-900 border border-gray-800 hover:bg-gray-800'
            }`}
          >
            <ChevronLeft size={16} className="inline" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'text-white bg-gray-800 border border-gray-700'
                      : 'text-gray-400 bg-gray-900 border border-gray-800 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === totalPages
                ? 'text-gray-600 bg-gray-900 border border-gray-800 cursor-not-allowed'
                : 'text-white bg-gray-900 border border-gray-800 hover:bg-gray-800'
            }`}
          >
            <ChevronRight size={16} className="inline" />
          </button>
        </div>
      )}
    </div>
  );
};

// Contacts Tab Component
const ContactsTab: React.FC<{ contacts: any[] }> = ({ contacts }) => {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-16">
        <Contact size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Contacts</h3>
        <p className="text-gray-500">This agent hasn't added any contacts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Contact List</h2>
        <p className="text-sm text-gray-500">{contacts.length} total contacts</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact, index) => (
          <div
            key={contact.id}
            className="p-4 rounded-lg bg-gray-900/50 border-2 border-gray-800 hover:border-gray-500 hover:scale-[1.03] hover:-translate-y-2 transition-all duration-500 ease-out opacity-0"
            style={{
              animation: `fadeInUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms forwards`
            }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-gray-800 border border-gray-700">
                <Contact size={16} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium mb-2">
                  {contact.name || 'Unnamed Contact'}
                </h3>
                <div className="space-y-1.5 text-sm">
                  {contact.phone_number && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone size={14} />
                      <span>{contact.phone_number}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail size={14} />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.notes && (
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2">{contact.notes}</p>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Added {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Phone Tab Component
const PhoneTab: React.FC<{ phoneNumber: any }> = ({ phoneNumber }) => {
  if (!phoneNumber) {
    return (
      <div className="text-center py-16">
        <Phone size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Phone Number</h3>
        <p className="text-gray-500">This agent doesn't have a Twilio phone number assigned</p>
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phoneNumber.twilio_phone_number);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Twilio Phone Number</h2>
        <p className="text-sm text-gray-500">Voice agent communication number</p>
      </div>
      
      <div className="p-8 rounded-lg bg-gray-900/50 border border-gray-800 w-full max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
              <Phone size={28} className="text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-bold text-white mb-3 tracking-wide font-mono">
                {phoneNumber.twilio_phone_number}
              </p>
              <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  phoneNumber.is_active
                    ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                    : 'text-red-400 bg-red-500/10 border border-red-500/20'
                }`}
              >
                {phoneNumber.is_active ? 'Active' : 'Inactive'}
              </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <Copy size={16} />
            <span>Copy Number</span>
          </button>
          
          <div className="pt-6 border-t border-gray-800 space-y-2 text-xs text-gray-500">
            <p>
              <span className="text-gray-400 font-medium">SID:</span>{' '}
              <span className="font-mono text-gray-500">{phoneNumber.twilio_sid}</span>
            </p>
            <p>
              <span className="text-gray-400 font-medium">Created:</span>{' '}
              <span>{new Date(phoneNumber.created_at).toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentFullDetails;
