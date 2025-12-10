'use client';

import React, { useState } from 'react';
import { X, Search, CheckCircle, XCircle, User, Building, FileText, Phone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllAgents, verifyAgent, unverifyAgent } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from '@/contexts/ThemeContext';
import type { AgentWithStats } from '@/types/admin.types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

interface VerificationRequestsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerificationRequestsSheet: React.FC<VerificationRequestsSheetProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
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
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
          }`}
          onClick={onClose}
        />
      )}

      {/* Side Sheet - Opens from right, extends left, stops before sidebar */}
      <div
        className={`fixed top-0 right-0 h-full border-l z-50 transform transition-transform duration-300 ease-out ${
          theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ 
          background: theme === 'dark' ? 'rgba(10, 15, 25, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          width: 'calc(100vw - 300px)', // Extends more towards left, stops 300px from left (sidebar is 280px + 20px margin)
          minWidth: '600px', // Minimum width for smaller screens
          maxWidth: '1600px', // Maximum width for very large screens
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-2xl font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Verification Requests
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {agents ? `${agents.length} ${agents.length === 1 ? 'agent' : 'agents'}` : 'Loading...'}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg placeholder-gray-500 border focus:outline-none transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'text-white bg-gray-800 border-gray-700 focus:border-gray-600'
                      : 'text-gray-900 bg-white border-gray-300 focus:border-blue-400 shadow-sm'
                  }`}
                />
              </div>

              {/* Verification Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setVerificationFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    verificationFilter === 'all'
                      ? theme === 'dark'
                      ? 'bg-gray-800 border border-gray-600 text-white'
                        : 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                      : theme === 'dark'
                      ? 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                      : 'bg-white border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-700 shadow-sm'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setVerificationFilter('verified')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    verificationFilter === 'verified'
                      ? theme === 'dark'
                      ? 'bg-gray-800 border border-gray-600 text-white'
                        : 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                      : theme === 'dark'
                      ? 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                      : 'bg-white border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-700 shadow-sm'
                  }`}
                >
                  Verified
                </button>
                <button
                  onClick={() => setVerificationFilter('unverified')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    verificationFilter === 'unverified'
                      ? theme === 'dark'
                      ? 'bg-gray-800 border border-gray-600 text-white'
                        : 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                      : theme === 'dark'
                      ? 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                      : 'bg-white border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-700 shadow-sm'
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
                <User size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  No Agents Found
                </h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {verificationFilter === 'unverified'
                    ? 'No unverified agents at the moment'
                    : 'Try adjusting your filters'}
                </p>
              </div>
            ) : isLoading ? (
              <LoadingSpinner text="Loading agents..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {agents.map((agent: AgentWithStats) => (
                  <div
                    key={agent.id}
                    className={`p-6 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-black/20'
                        : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-blue-100/50 shadow-sm'
                    }`}
                    style={{ 
                      minHeight: '380px',
                      aspectRatio: '1 / 1',
                      maxWidth: '100%'
                    }}
                  >
                    {/* Agent Info */}
                    <div className="flex-1 mb-4 min-h-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <h3 className={`text-lg font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {agent.full_name}
                            </h3>
                            {agent.is_verified ? (
                              <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
                                theme === 'dark'
                                  ? 'text-green-400 bg-green-500/10 border border-green-500/30'
                                  : 'text-green-700 bg-green-100 border border-green-300'
                              }`}>
                                Verified
                              </span>
                            ) : (
                              <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
                                theme === 'dark'
                                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                                  : 'text-blue-700 bg-blue-100 border border-blue-300'
                              }`}>
                                Unverified
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mb-2 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} title={agent.email}>
                            {agent.email}
                          </p>
                          {agent.company_name && (
                            <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} title={agent.company_name}>
                              {agent.company_name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stats Grid */}
                      {agent.stats && (
                        <div className={`grid grid-cols-2 gap-3 pt-4 border-t mb-4 ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <div className="flex flex-col items-center text-center">
                            <Building size={18} className={`mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Properties</p>
                            <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {agent.stats.properties_count}
                            </p>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <FileText size={18} className={`mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Documents</p>
                            <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {agent.stats.documents_count}
                            </p>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <User size={18} className={`mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Contacts</p>
                            <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {agent.stats.contacts_count}
                            </p>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <Phone size={18} className={`mb-1.5 ${agent.stats.has_phone_number ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Phone</p>
                            <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {agent.stats.has_phone_number ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-2">
                      {agent.is_verified ? (
                        <button
                          onClick={() => handleUnverify(agent.id)}
                          disabled={unverifyingAgentId === agent.id || verifyingAgentId !== null}
                          className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                            theme === 'dark'
                              ? 'text-gray-300 bg-gray-800 border-gray-700 hover:border-gray-600 hover:text-white'
                              : 'text-gray-700 bg-white border-gray-300 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-sm'
                          }`}
                        >
                          <XCircle size={18} />
                          <span>{unverifyingAgentId === agent.id ? 'Unverifying...' : 'Unverify'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(agent.id)}
                          disabled={verifyingAgentId === agent.id || unverifyingAgentId !== null}
                          className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                            theme === 'dark'
                              ? 'text-gray-300 bg-gray-800 border-gray-700 hover:border-gray-600 hover:text-white'
                              : 'text-gray-700 bg-white border-gray-300 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-sm'
                          }`}
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

