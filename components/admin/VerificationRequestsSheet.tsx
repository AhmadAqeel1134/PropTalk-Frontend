'use client';

import React, { useState } from 'react';
import { X, Search, CheckCircle, XCircle, User, Building, FileText, Phone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllAgents, verifyAgent, unverifyAgent } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import type { AgentWithStats } from '@/types/admin.types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

interface VerificationRequestsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerificationRequestsSheet: React.FC<VerificationRequestsSheetProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('unverified');
  const [verifyingAgentId, setVerifyingAgentId] = useState<string | null>(null);
  const [unverifyingAgentId, setUnverifyingAgentId] = useState<string | null>(null);
  
  // Determine backend filter value
  const backendVerifiedFilter = verificationFilter === 'all' 
    ? undefined 
    : verificationFilter === 'verified';

  // Debounce search term to avoid excessive API calls (500ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: agents, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'agents', 'verification', debouncedSearchTerm || '', verificationFilter],
    queryFn: async () => {
      // Backend handles all filtering - server-side filtering
      return await getAllAgents(
        debouncedSearchTerm || undefined,
        backendVerifiedFilter,
        undefined // No is_active filter for verification sheet
      );
    },
    enabled: isOpen, // Only fetch when sheet is open
    staleTime: 0, // Always fetch fresh data when filters change
    gcTime: 30000, // Keep in cache for 30 seconds
    refetchOnMount: 'always', // Always refetch when component mounts
  });

  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: verifyAgent,
    onSuccess: async () => {
      // Clear verifying state
      setVerifyingAgentId(null);
      
      // 100% Server-side: Invalidate all queries and let server handle filtering
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'agents'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
      ]);
      
      // Refetch current query - server will return correctly filtered data
      refetch();
    },
    onError: () => {
      // Clear verifying state on error
      setVerifyingAgentId(null);
      // Refetch on error to get correct state from server
      refetch();
    },
  });

  const unverifyMutation = useMutation({
    mutationFn: unverifyAgent,
    onSuccess: async () => {
      // Clear unverifying state
      setUnverifyingAgentId(null);
      
      // 100% Server-side: Invalidate all queries and let server handle filtering
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'agents'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
      ]);
      
      // Refetch current query - server will return correctly filtered data
      refetch();
    },
    onError: () => {
      // Clear unverifying state on error
      setUnverifyingAgentId(null);
      // Refetch on error to get correct state from server
      refetch();
    },
  });

  const handleVerify = async (agentId: string) => {
    setVerifyingAgentId(agentId);
    verifyMutation.mutate(agentId);
  };

  const handleUnverify = async (agentId: string) => {
    setUnverifyingAgentId(agentId);
    unverifyMutation.mutate(agentId);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Side Sheet - Opens from right, extends left, stops before sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-900 border-l border-gray-800 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          background: 'rgba(10, 15, 25, 0.95)',
          width: 'calc(100vw - 300px)', // Extends more towards left, stops 300px from left (sidebar is 280px + 20px margin)
          minWidth: '600px', // Minimum width for smaller screens
          maxWidth: '1600px', // Maximum width for very large screens
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">Verification Requests</h2>
                <p className="text-sm text-gray-400">
                  {agents ? `${agents.length} ${agents.length === 1 ? 'agent' : 'agents'}` : 'Loading...'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-500 bg-gray-800 border border-gray-700 focus:outline-none focus:border-gray-600 transition-colors duration-200"
                />
              </div>

              {/* Verification Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setVerificationFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    verificationFilter === 'all'
                      ? 'bg-gray-800 border border-gray-600 text-white'
                      : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setVerificationFilter('verified')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    verificationFilter === 'verified'
                      ? 'bg-gray-800 border border-gray-600 text-white'
                      : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Verified
                </button>
                <button
                  onClick={() => setVerificationFilter('unverified')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    verificationFilter === 'unverified'
                      ? 'bg-gray-800 border border-gray-600 text-white'
                      : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Unverified
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <LoadingSpinner text="Loading agents..." />
            ) : error ? (
              <ErrorMessage
                message={error.message || 'Failed to load agents'}
                onRetry={() => refetch()}
              />
            ) : !agents || agents.length === 0 ? (
              <div className="text-center py-12">
                <User size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Agents Found</h3>
                <p className="text-gray-400">
                  {verificationFilter === 'unverified'
                    ? 'No unverified agents at the moment'
                    : 'Try adjusting your filters'}
                </p>
              </div>
            ) : isLoading ? (
              <LoadingSpinner text="Loading agents..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {agents.map((agent: AgentWithStats) => (
                  <div
                    key={agent.id}
                    className="p-6 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 flex flex-col aspect-square"
                    style={{ minHeight: '320px' }}
                  >
                    {/* Agent Info */}
                    <div className="flex-1 mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-white truncate">{agent.full_name}</h3>
                            {agent.is_verified ? (
                              <span className="px-2.5 py-1 rounded-md text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 flex-shrink-0">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md text-xs font-medium text-red-400 bg-red-400/10 border border-red-400/20 flex-shrink-0">
                                Unverified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2 truncate" title={agent.email}>{agent.email}</p>
                          {agent.company_name && (
                            <p className="text-sm text-gray-500 truncate" title={agent.company_name}>{agent.company_name}</p>
                          )}
                        </div>
                      </div>

                      {/* Stats Grid */}
                      {agent.stats && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                          <div className="flex flex-col items-center text-center">
                            <Building size={20} className="text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 mb-1">Properties</p>
                            <p className="text-lg font-semibold text-white">{agent.stats.properties_count}</p>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <FileText size={20} className="text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 mb-1">Documents</p>
                            <p className="text-lg font-semibold text-white">{agent.stats.documents_count}</p>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <User size={20} className="text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 mb-1">Contacts</p>
                            <p className="text-lg font-semibold text-white">{agent.stats.contacts_count}</p>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <Phone size={20} className={`mb-2 ${agent.stats.has_phone_number ? 'text-green-400' : 'text-gray-400'}`} />
                            <p className="text-xs text-gray-500 mb-1">Phone</p>
                            <p className="text-lg font-semibold text-white">
                              {agent.stats.has_phone_number ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      {agent.is_verified ? (
                        <button
                          onClick={() => handleUnverify(agent.id)}
                          disabled={unverifyingAgentId === agent.id || verifyingAgentId !== null}
                          className="w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 hover:border-gray-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <XCircle size={18} />
                          <span>{unverifyingAgentId === agent.id ? 'Unverifying...' : 'Unverify'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(agent.id)}
                          disabled={verifyingAgentId === agent.id || unverifyingAgentId !== null}
                          className="w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 hover:border-gray-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          <span>{verifyingAgentId === agent.id ? 'Verifying...' : 'Verify Agent'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerificationRequestsSheet;

