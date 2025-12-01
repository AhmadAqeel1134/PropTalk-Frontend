'use client';

import React, { useState } from 'react';
import { useAgentDetails, useAgentDocumentsPaginated, useAgentPropertiesPaginated } from '@/hooks/useAdmin';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import PageTransition from '@/components/common/PageTransition';
import {
  ArrowLeft,
  User,
  Building,
  FileText,
  Contact,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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
    // Reset pagination when switching tabs
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
  
  // Use paginated counts if available, otherwise fallback to full details count
  const documentsCount = paginatedDocuments?.total ?? documents.length;
  const propertiesCount = paginatedProperties?.total ?? properties.length;

  const tabs = [
    { id: 'info' as TabType, label: 'Agent Info', icon: User },
    { id: 'properties' as TabType, label: 'Properties', icon: Building, count: propertiesCount },
    { id: 'documents' as TabType, label: 'Documents', icon: FileText, count: documentsCount },
    { id: 'contacts' as TabType, label: 'Contacts', icon: Contact, count: contacts.length },
    { id: 'phone' as TabType, label: 'Phone Number', icon: Phone },
  ];

  return (
    <PageTransition>
      <div
        className="min-h-screen p-4 md:p-8"
        style={{
          background: 'rgba(10, 15, 25, 0.95)',
        }}
      >
        <div className="max-w-full">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 mb-4 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Agents</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2">
                {agent.full_name}
              </h1>
              <p className="text-gray-400">
                {agent.company_name || 'Independent Agent'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Status Badges */}
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                  agent.is_active
                    ? 'text-green-400 bg-green-400/10 border border-green-400/20'
                    : 'text-red-400 bg-red-400/10 border border-red-400/20'
                }`}
              >
                {agent.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>{agent.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                  agent.is_verified
                    ? 'text-green-400 bg-green-400/10 border border-green-400/20'
                    : 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20'
                }`}
              >
                {agent.is_verified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>{agent.is_verified ? 'Verified' : 'Unverified'}</span>
              </div>
              <button
                onClick={() => refetch()}
                className="p-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white transition-all duration-200"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 p-2 rounded-lg bg-gray-900 border border-gray-800 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                    isActive ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg p-8 bg-gray-900 border border-gray-800 overflow-hidden">
          <div
            key={activeTab}
            className="animate-in fade-in slide-in-from-right-4 duration-500"
          >
            {activeTab === 'info' && <AgentInfo agent={agent} />}
            {activeTab === 'properties' && (
              <PropertiesTab
                properties={paginatedProperties?.items ?? []}
                total={paginatedProperties?.total ?? 0}
                page={propertiesPage}
                pageSize={propertiesPageSize}
                isLoading={propertiesLoading}
                onPageChange={setPropertiesPage}
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
      </div>
    </PageTransition>
  );
};

// Agent Info Tab Component
const AgentInfo: React.FC<{ agent: any }> = ({ agent }) => {
  const infoItems = [
    { icon: Mail, label: 'Email', value: agent.email },
    { icon: Phone, label: 'Phone', value: agent.phone || 'N/A' },
    { icon: Building, label: 'Company', value: agent.company_name || 'N/A' },
    { icon: MapPin, label: 'Address', value: agent.address || 'N/A' },
    { icon: Calendar, label: 'Created', value: new Date(agent.created_at).toLocaleDateString() },
    { icon: Calendar, label: 'Updated', value: new Date(agent.updated_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">Agent Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoItems.map((item, index) => (
          <div
            key={item.label}
            className="opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
          >
            <InfoItem icon={item.icon} label={item.label} value={item.value} />
          </div>
        ))}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: any; label: string; value: string }> = ({ icon: Icon, label, value }) => {
  return (
    <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20">
      <div className="flex items-center space-x-2 mb-2">
        <Icon size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-white font-semibold">{value}</p>
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
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({ properties, total, page, pageSize, isLoading, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner text="Loading properties..." />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 animate-in fade-in duration-500">
        <Building size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Properties</h3>
        <p className="text-gray-400">This agent hasn't listed any properties yet</p>
      </div>
    );
  }

  // Format price with commas
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Properties ({total})</h2>
        <p className="text-sm text-gray-400">
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Address</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Type</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Price</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Beds/Baths</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property, index) => (
              <tr
                key={property.id}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-all duration-200 opacity-0 animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <td className="py-4 px-4 text-white">{property.address}</td>
                <td className="py-4 px-4 text-gray-400">{property.property_type || 'N/A'}</td>
                <td className="py-4 px-4 text-white font-semibold">{formatPrice(property.price)}</td>
                <td className="py-4 px-4 text-gray-400">
                  {property.bedrooms || 0} / {property.bathrooms || 0}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      property.is_available === 'yes' || property.is_available === 'true'
                        ? 'text-green-400 bg-green-400/10 border border-green-400/20'
                        : 'text-red-400 bg-red-400/10 border border-red-400/20'
                    }`}
                  >
                    {property.is_available === 'yes' || property.is_available === 'true' ? 'Available' : 'Unavailable'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              page === 1
                ? 'text-gray-600 bg-gray-800 border border-gray-700 cursor-not-allowed'
                : 'text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20'
            }`}
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-1">
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
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    page === pageNum
                      ? 'text-white bg-gray-700 border border-gray-600'
                      : 'text-gray-400 bg-gray-800 border border-gray-700 hover:text-white hover:bg-gray-700'
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
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              page === totalPages
                ? 'text-gray-600 bg-gray-800 border border-gray-700 cursor-not-allowed'
                : 'text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20'
            }`}
          >
            <span>Next</span>
            <ChevronRight size={18} />
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
      <div className="text-center py-12">
        <LoadingSpinner text="Loading documents..." />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Documents</h3>
        <p className="text-gray-400">This agent hasn't uploaded any documents yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Documents ({total})</h2>
        <p className="text-sm text-gray-400">
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 opacity-0 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-start justify-between mb-3">
              <FileText size={24} className="text-gray-400" />
              <span className="px-2 py-1 rounded-md text-xs font-medium text-gray-300 bg-gray-700 border border-gray-600">
                {doc.file_type.toUpperCase()}
              </span>
            </div>
            <h4 className="text-white font-semibold mb-2 truncate">{doc.file_name}</h4>
            <p className="text-xs text-gray-500 mb-3">
              {doc.file_size || 'Size unknown'} • {new Date(doc.created_at).toLocaleDateString()}
            </p>
            <a
              href={doc.cloudinary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 transition-all duration-200"
            >
              <Download size={14} />
              <span>Download</span>
            </a>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              page === 1
                ? 'text-gray-600 bg-gray-800 border border-gray-700 cursor-not-allowed'
                : 'text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20'
            }`}
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-1">
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
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    page === pageNum
                      ? 'text-white bg-gray-700 border border-gray-600'
                      : 'text-gray-400 bg-gray-800 border border-gray-700 hover:text-white hover:bg-gray-700'
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
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              page === totalPages
                ? 'text-gray-600 bg-gray-800 border border-gray-700 cursor-not-allowed'
                : 'text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20'
            }`}
          >
            <span>Next</span>
            <ChevronRight size={18} />
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
      <div className="text-center py-12 animate-in fade-in duration-500">
        <Contact size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Contacts Available</h3>
        <p className="text-gray-400">This agent hasn't added any contacts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-6">Contacts ({contacts.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Name</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Phone</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Email</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Notes</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Created</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => (
              <tr
                key={contact.id}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-all duration-200 opacity-0 animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <td className="py-4 px-4 text-white font-semibold">{contact.name || 'N/A'}</td>
                <td className="py-4 px-4 text-gray-400">{contact.phone_number || 'N/A'}</td>
                <td className="py-4 px-4 text-gray-400">{contact.email || 'N/A'}</td>
                <td className="py-4 px-4 text-gray-400 max-w-xs truncate">{contact.notes || '—'}</td>
                <td className="py-4 px-4 text-gray-500 text-sm">
                  {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Phone Tab Component
const PhoneTab: React.FC<{ phoneNumber: any }> = ({ phoneNumber }) => {
  if (!phoneNumber) {
    return (
      <div className="text-center py-12 animate-in fade-in duration-500">
        <Phone size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Phone Number</h3>
        <p className="text-gray-400">This agent doesn't have a Twilio phone number assigned</p>
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phoneNumber.twilio_phone_number);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-semibold text-white mb-6">Twilio Phone Number</h2>
      <div className="p-8 rounded-lg text-center bg-gray-800 border border-gray-700">
        <p className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-wide">
          {phoneNumber.twilio_phone_number}
        </p>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <span
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              phoneNumber.is_active
                ? 'text-green-400 bg-green-400/10 border border-green-400/20'
                : 'text-red-400 bg-red-400/10 border border-red-400/20'
            }`}
          >
            {phoneNumber.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="px-6 py-3 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20"
        >
          Copy Number
        </button>
        <div className="mt-6 space-y-1">
          <p className="text-xs text-gray-500">
            SID: <span className="text-gray-400 font-mono">{phoneNumber.twilio_sid}</span>
          </p>
          <p className="text-xs text-gray-500">
            Created: <span className="text-gray-400">{new Date(phoneNumber.created_at).toLocaleString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentFullDetails;

