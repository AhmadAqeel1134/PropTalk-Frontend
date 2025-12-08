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
        {/* Header Section */}
        <div
          className={`mb-8 transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gray-800/60 border border-gray-700/50">
                  <Users size={24} className="text-gray-300" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                    Agents
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base">
                    {agents ? `${agents.length} ${agents.length === 1 ? 'Agent' : 'Agents'} Found` : 'Loading...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl self-start sm:self-auto"
                title="Refresh agents list"
              >
                <RefreshCw size={20} className={isFetching ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl opacity-0" style={{ animation: 'fadeInUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) 150ms forwards' }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-500 bg-gray-800/60 border border-gray-700/50 focus:outline-none focus:border-gray-600 focus:bg-gray-800/80 transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 rounded-xl text-white bg-gray-800/60 border border-gray-700/50 focus:outline-none focus:border-gray-600 focus:bg-gray-800/80 cursor-pointer transition-all duration-200 w-full lg:w-auto"
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
                className="px-4 py-3 rounded-xl text-white bg-gray-800/60 border border-gray-700/50 focus:outline-none focus:border-gray-600 focus:bg-gray-800/80 cursor-pointer transition-all duration-200 w-full lg:w-auto"
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
                className="px-5 py-3 rounded-xl text-sm font-medium text-gray-300 bg-gray-800/60 border border-gray-700/50 hover:border-gray-600 hover:text-white hover:bg-gray-800/80 transition-all duration-200 whitespace-nowrap shadow-lg hover:shadow-xl"
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
          <div className="rounded-2xl p-12 bg-gray-900/60 border border-gray-800/50 text-center backdrop-blur-sm shadow-xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/60 border border-gray-700/50 mb-6 mx-auto">
              <Users size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Agents Found</h3>
            <p className="text-gray-400">
              {debouncedSearchTerm || statusFilter !== 'all' || verificationFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No agents registered yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <div
                key={agent.id}
                className="opacity-0"
                style={{ 
                  animation: `fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) ${index * 150}ms forwards`
                }}
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
