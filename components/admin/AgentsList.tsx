'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAgents } from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks/useDebounce';
import AgentCard from './AgentCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import PageTransition from '@/components/common/PageTransition';
import { Search, Users, RefreshCw } from 'lucide-react';

const AgentsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [verificationFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [isMounted, setIsMounted] = useState(false);

  // Debounce search term to avoid excessive API calls (500ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Convert filters to backend parameters
  const isActiveFilter = useMemo(() => {
    if (statusFilter === 'all') return undefined;
    return statusFilter === 'active';
  }, [statusFilter]);

  const isVerifiedFilter = useMemo(() => {
    if (verificationFilter === 'all') return undefined;
    return verificationFilter === 'verified';
  }, [verificationFilter]);

  // Fetch agents with server-side filtering
  const { data: agents, isLoading, error, refetch, isFetching } = useAgents(
    debouncedSearchTerm || undefined,
    isVerifiedFilter,
    isActiveFilter
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleViewDetails = (agentId: string) => {
    window.location.href = `/admin/agents/${agentId}`;
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setVerifiedFilter('all');
  };

  if (error) {
    return (
      <ErrorMessage
        message={error.message || 'Failed to load agents'}
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

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
        <div
          className={`mb-8 flex items-center justify-between transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2">
              Agents
            </h1>
            <p className="text-gray-400">
              {agents ? `${agents.length} ${agents.length === 1 ? 'Agent' : 'Agents'} Found` : 'Loading...'}
            </p>
          </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh agents list"
            >
              <RefreshCw size={20} className={isFetching ? 'animate-spin' : ''} />
            </button>
        </div>

        {/* Filters Section */}
        <div className="mb-8 rounded-lg p-6 bg-gray-900 border border-gray-800">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-500 bg-gray-800 border border-gray-700 focus:outline-none focus:border-gray-600 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 rounded-lg text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-gray-600 cursor-pointer transition-colors duration-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Verified Filter */}
            <div>
              <select
                value={verificationFilter}
                onChange={(e) => setVerifiedFilter(e.target.value as any)}
                className="px-4 py-3 rounded-lg text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-gray-600 cursor-pointer transition-colors duration-200"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || statusFilter !== 'all' || verificationFilter !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 hover:border-gray-600 hover:text-white transition-all duration-200 whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Agents Grid */}
        {isLoading ? (
          <LoadingSpinner text="Loading agents..." />
        ) : !agents || agents.length === 0 ? (
          <div className="rounded-lg p-12 bg-gray-900 border border-gray-800 text-center">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Agents Found</h3>
            <p className="text-gray-400">
              {debouncedSearchTerm || statusFilter !== 'all' || verificationFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No agents registered yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, index) => (
              <div
                key={agent.id}
                className={`transition-all duration-500 ease-out ${
                  isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <AgentCard
                  agent={agent}
                  onViewDetails={handleViewDetails}
                />
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </PageTransition>
  );
};

export default AgentsList;
