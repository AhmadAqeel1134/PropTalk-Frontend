'use client';

import React, { useState, useMemo } from 'react';
import { useAgentProperties } from '@/hooks/useAdmin';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import {
  Building,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  User,
  Phone,
  Calendar,
  RefreshCw,
} from 'lucide-react';

interface AgentPropertiesProps {
  agentId: string;
  agentName?: string;
  onBack?: () => void;
}

const AgentProperties: React.FC<AgentPropertiesProps> = ({ agentId, agentName, onBack }) => {
  const { data: properties, isLoading, error, refetch } = useAgentProperties(agentId);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'yes' | 'no'>('all');

  // Get unique property types for filter
  const propertyTypes = useMemo(() => {
    if (!properties) return [];
    const types = new Set(properties.map(p => p.property_type).filter(Boolean));
    return Array.from(types);
  }, [properties]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    return properties.filter((property) => {
      const matchesSearch =
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || property.property_type === typeFilter;
      const matchesAvailability =
        availabilityFilter === 'all' || property.is_available === availabilityFilter;
      return matchesSearch && matchesType && matchesAvailability;
    });
  }, [properties, searchTerm, typeFilter, availabilityFilter]);

  if (isLoading) {
    return <LoadingSpinner text="Loading properties..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message || 'Failed to load properties'}
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
                Properties
              </h1>
              <p className="text-2xl text-blue-300">
                {agentName && `${agentName} • `}
                {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'}
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
                  placeholder="Search by address, city, or owner..."
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
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                className="px-4 py-3 rounded-lg text-white transition-all duration-300 focus:outline-none cursor-pointer"
                style={{
                  background: 'rgba(10, 22, 40, 0.6)',
                  border: '1px solid rgba(77, 184, 255, 0.3)',
                }}
              >
                <option value="all">All Availability</option>
                <option value="yes">Available</option>
                <option value="no">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties List */}
        {filteredProperties.length === 0 ? (
          <div
            className="rounded-2xl p-12 backdrop-blur-sm text-center"
            style={{
              background: 'rgba(15, 31, 58, 0.7)',
              border: '1px solid rgba(77, 184, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Building size={48} className="text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Properties Found</h3>
            <p className="text-blue-200">
              {properties?.length === 0
                ? 'This agent has no properties listed'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgba(15, 31, 58, 0.7)',
                  border: '1px solid rgba(77, 184, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Main Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">{property.address}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              property.is_available === 'yes' ? 'text-green-400' : 'text-red-400'
                            }`}
                            style={{
                              background:
                                property.is_available === 'yes'
                                  ? 'rgba(34, 197, 94, 0.1)'
                                  : 'rgba(239, 68, 68, 0.1)',
                            }}
                          >
                            {property.is_available === 'yes' ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        {(property.city || property.state) && (
                          <p className="text-blue-300 flex items-center space-x-2">
                            <MapPin size={14} />
                            <span>
                              {property.city}
                              {property.city && property.state && ', '}
                              {property.state} {property.zip_code}
                            </span>
                          </p>
                        )}
                      </div>
                      {property.property_type && (
                        <span
                          className="px-3 py-1 rounded-lg text-sm font-semibold text-blue-400"
                          style={{
                            background: 'rgba(59, 158, 255, 0.1)',
                            border: '1px solid rgba(77, 184, 255, 0.3)',
                          }}
                        >
                          {property.property_type}
                        </span>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {property.price && (
                        <div className="flex items-center space-x-2 text-white">
                          <DollarSign size={16} className="text-green-400" />
                          <span className="font-semibold">{property.price}</span>
                        </div>
                      )}
                      {property.bedrooms !== null && (
                        <div className="flex items-center space-x-2 text-white">
                          <Bed size={16} className="text-blue-400" />
                          <span>{property.bedrooms} Beds</span>
                        </div>
                      )}
                      {property.bathrooms !== null && (
                        <div className="flex items-center space-x-2 text-white">
                          <Bath size={16} className="text-blue-400" />
                          <span>{property.bathrooms} Baths</span>
                        </div>
                      )}
                      {property.square_feet !== null && (
                        <div className="flex items-center space-x-2 text-white">
                          <Maximize size={16} className="text-blue-400" />
                          <span>{property.square_feet} sqft</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {property.description && (
                      <p className="text-blue-200 text-sm mb-4 line-clamp-2">
                        {property.description}
                      </p>
                    )}
                  </div>

                  {/* Right: Owner Info */}
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: 'rgba(59, 158, 255, 0.05)',
                      border: '1px solid rgba(77, 184, 255, 0.2)',
                    }}
                  >
                    <h4 className="text-sm font-semibold text-blue-300 mb-3">Owner Information</h4>
                    {property.owner_name && (
                      <div className="flex items-center space-x-2 mb-2 text-white">
                        <User size={14} className="text-blue-400" />
                        <span className="text-sm">{property.owner_name}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 mb-3 text-white">
                      <Phone size={14} className="text-blue-400" />
                      <span className="text-sm">{property.owner_phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-300 text-xs">
                      <Calendar size={12} />
                      <span>Listed {new Date(property.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentProperties;

