'use client'

// Component: CallHistoryList
// Purpose: Advanced call history with real-time filters, search, and smooth animations

import React, { useState, useMemo } from 'react';
import { Search, Filter, PhoneIncoming, PhoneOutgoing, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import CallCard from '@/components/twilio/CallCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useTheme } from '@/contexts/ThemeContext';

interface Call {
  id: string;
  contact_name: string | null;
  from_number: string;
  to_number: string;
  status: 'completed' | 'failed' | 'busy' | 'no-answer' | 'in-progress';
  direction: 'inbound' | 'outbound';
  duration_seconds: number;
  recording_url: string | null;
  started_at: string | null;
  created_at: string;
}

export default function CallHistoryList() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const pageSize = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['calls', currentPage, statusFilter, directionFilter, searchTerm],
    queryFn: async () => {
      const { getCalls } = await import('@/lib/real_estate_agent/api');
      return getCalls({
        page: currentPage,
        page_size: pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        direction: directionFilter !== 'all' ? directionFilter : undefined,
        search: searchTerm || undefined
      });
    }
  });

  const filteredCalls = useMemo(() => {
    if (!data?.items) return [];
    
    return data.items.filter((call: Call) => {
      const matchesSearch = !searchTerm || 
        call.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.from_number.includes(searchTerm) ||
        call.to_number.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
      const matchesDirection = directionFilter === 'all' || call.direction === directionFilter;
      
      return matchesSearch && matchesStatus && matchesDirection;
    });
  }, [data?.items, searchTerm, statusFilter, directionFilter]);

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 group-focus-within:text-blue-400'
                : 'text-gray-500 group-focus-within:text-blue-600'
            }`}
            size={20}
          />
          <input
            type="text"
            placeholder="Search by contact name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-800 text-white focus:border-blue-500/50 focus:ring-blue-500/20'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm'
            }`}
          />
          {searchTerm && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div
                className={`px-2 py-1 rounded-md border ${
                  theme === 'dark'
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  {filteredCalls.length} results
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative group">
            <Filter
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
                theme === 'dark'
                  ? 'text-gray-400 group-focus-within:text-purple-400'
                  : 'text-gray-500 group-focus-within:text-purple-600'
              }`}
              size={16}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`pl-10 pr-8 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800 text-white focus:border-purple-500/50 focus:ring-purple-500/20 hover:border-gray-700'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20 hover:border-gray-400 shadow-sm'
              }`}
            >
              <option value="all">All Status</option>
              <option value="initiated">Initiated</option>
              <option value="completed">Completed</option>
              <option value="no-answer">No Answer</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className={`pl-10 pr-8 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800 text-white focus:border-purple-500/50 focus:ring-purple-500/20 hover:border-gray-700'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20 hover:border-gray-400 shadow-sm'
              }`}
            >
              <option value="all">All Calls</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
            {directionFilter === 'inbound' && (
              <PhoneIncoming
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}
                size={16}
              />
            )}
            {directionFilter === 'outbound' && (
              <PhoneOutgoing
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
                size={16}
              />
            )}
            {directionFilter === 'all' && (
              <Filter
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
                size={16}
              />
            )}
          </div>
        </div>
      </div>

      {filteredCalls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCalls.map((call: Call, index: number) => (
            <div
              key={call.id}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              <CallCard
                call={call}
                onViewDetails={(id) => setSelectedCall(id)}
                onListen={(url) => console.log('Play recording:', url)}
              />
            </div>
          ))}
        </div>
      )}

      {filteredCalls.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full border mb-4 ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Search
              className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
              size={32}
            />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            No calls found
          </h3>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {searchTerm ? 'Try adjusting your search or filters' : 'No call history available yet'}
          </p>
          {(searchTerm || statusFilter !== 'all' || directionFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDirectionFilter('all');
              }}
              className={`px-6 py-3 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                  : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-700 shadow-sm'
              }`}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div
          className={`flex items-center justify-between pt-6 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}
        >
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data?.total || 0)} of {data?.total || 0} calls
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                  : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : theme === 'dark'
                        ? 'bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-700 shadow-sm'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                  : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

