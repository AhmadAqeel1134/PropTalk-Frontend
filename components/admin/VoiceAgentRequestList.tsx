'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVoiceAgentRequests, approveVoiceAgentRequest, rejectVoiceAgentRequest } from '@/lib/api'
import { useTheme } from '@/contexts/ThemeContext'
import { Clock, CheckCircle, XCircle, User, Mail, Calendar, AlertCircle, Phone, Building, FileText } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ApproveVoiceAgentModal from './ApproveVoiceAgentModal'
import RejectVoiceAgentModal from './RejectVoiceAgentModal'

interface VoiceAgentRequest {
  id: string
  real_estate_agent_id: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
  agent_name?: string
  agent_email?: string
  agent_company_name?: string
  voice_agent_phone_number?: string
  agent_stats?: {
    properties_count: number
    documents_count: number
    contacts_count: number
    has_phone_number: boolean
  }
}

export default function VoiceAgentRequestList() {
  const { theme } = useTheme()
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [approveRequestId, setApproveRequestId] = useState<string | null>(null)
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ items: VoiceAgentRequest[], total: number }>({
    queryKey: ['voice-agent-requests', statusFilter],
    queryFn: () => getVoiceAgentRequests(statusFilter === 'all' ? undefined : statusFilter)
  })

  const approveMutation = useMutation({
    mutationFn: ({ requestId, phoneNumber }: { requestId: string; phoneNumber: string }) =>
      approveVoiceAgentRequest(requestId, phoneNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-agent-requests'] })
      queryClient.invalidateQueries({ queryKey: ['voice-agents-admin'] })
      setApproveRequestId(null)
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      rejectVoiceAgentRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-agent-requests'] })
      setRejectRequestId(null)
    }
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  const requests = data?.items || []

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4 mb-4">
        <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Filter by Status:
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === 'all'
                ? theme === 'dark'
                ? 'bg-gray-800 border border-gray-600 text-white'
                  : 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                : theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 shadow-sm'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === 'pending'
                ? theme === 'dark'
                ? 'bg-gray-800 border border-gray-600 text-white'
                  : 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                : theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 shadow-sm'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === 'approved'
                ? theme === 'dark'
                ? 'bg-gray-800 border border-gray-600 text-white'
                  : 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                : theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 shadow-sm'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === 'rejected'
                ? theme === 'dark'
                ? 'bg-gray-800 border border-gray-600 text-white'
                  : 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                : theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 shadow-sm'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      {requests.length === 0 ? (
        <div
          className={`text-center py-16 border rounded-xl ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <AlertCircle className={`size-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            No Requests Found
          </h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {statusFilter === 'pending' 
              ? 'No pending voice agent requests' 
              : statusFilter === 'all'
              ? 'No voice agent requests'
              : `No ${statusFilter} requests`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {requests.map((request) => {
            const statusConfig = {
              pending: {
                icon: Clock,
                color: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
                bg: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100',
                border: theme === 'dark' ? 'border-blue-500/30' : 'border-blue-300',
                label: 'Pending'
              },
              approved: {
                icon: CheckCircle,
                color: theme === 'dark' ? 'text-green-400' : 'text-green-700',
                bg: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-100',
                border: theme === 'dark' ? 'border-green-500/30' : 'border-green-300',
                label: 'Approved'
              },
              rejected: {
                icon: XCircle,
                color: theme === 'dark' ? 'text-red-400' : 'text-red-700',
                bg: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-100',
                border: theme === 'dark' ? 'border-red-500/30' : 'border-red-300',
                label: 'Rejected'
              }
            }

            const config = statusConfig[request.status]
            const Icon = config.icon

            return (
              <div
                key={request.id}
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
                {/* Request Info */}
                <div className="flex-1 mb-4 min-h-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h3 className={`text-lg font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {request.agent_name || 'Unknown Agent'}
                        </h3>
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ${config.bg} ${config.border} border`}>
                          <Icon className={config.color} size={14} />
                          <span className={config.color}>{config.label}</span>
                        </div>
                      </div>
                      <p className={`text-sm mb-2 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} title={request.agent_email || 'N/A'}>
                        {request.agent_email || 'N/A'}
                      </p>
                      {request.agent_company_name && (
                        <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} title={request.agent_company_name}>
                          {request.agent_company_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid - Same as verification sheet */}
                  <div className={`grid grid-cols-2 gap-3 pt-4 border-t mb-4 ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex flex-col items-center text-center">
                      <Building size={18} className={`mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Properties</p>
                      <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {request.agent_stats?.properties_count ?? 0}
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <FileText size={18} className={`mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Documents</p>
                      <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {request.agent_stats?.documents_count ?? 0}
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <User size={18} className={`mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Contacts</p>
                      <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {request.agent_stats?.contacts_count ?? 0}
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <Phone size={18} className={`mb-1.5 ${request.agent_stats?.has_phone_number ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Phone</p>
                      <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {request.agent_stats?.has_phone_number ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className={`mt-3 p-2.5 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className="text-xs text-red-400 font-medium mb-1">Rejection Reason:</p>
                      <p className={`text-xs line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {request.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto pt-2">
                  {request.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApproveRequestId(request.id)}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 flex items-center justify-center gap-2 ${
                          theme === 'dark'
                            ? 'text-gray-300 bg-gray-800 border-gray-700 hover:border-gray-600 hover:text-white'
                            : 'text-gray-700 bg-white border-gray-300 hover:border-green-400 hover:text-green-700 hover:bg-green-50 shadow-sm'
                        }`}
                      >
                        <CheckCircle size={18} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => setRejectRequestId(request.id)}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 flex items-center justify-center gap-2 ${
                          theme === 'dark'
                            ? 'text-gray-300 bg-gray-800 border-gray-700 hover:border-gray-600 hover:text-white'
                            : 'text-gray-700 bg-white border-gray-300 hover:border-red-400 hover:text-red-700 hover:bg-red-50 shadow-sm'
                        }`}
                      >
                        <XCircle size={18} />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : request.status === 'approved' ? (
                    <div className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'text-green-400 bg-green-500/10 border border-green-500/30'
                        : 'text-green-700 bg-green-100 border border-green-300'
                    }`}>
                      <CheckCircle size={18} />
                      <span>Approved</span>
                    </div>
                  ) : (
                    <div className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                        : 'text-red-700 bg-red-100 border border-red-300'
                    }`}>
                      <XCircle size={18} />
                      <span>Rejected</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {approveRequestId && (
        <ApproveVoiceAgentModal
          requestId={approveRequestId}
          isOpen={!!approveRequestId}
          onClose={() => setApproveRequestId(null)}
          onApprove={(phoneNumber) =>
            approveMutation.mutate({ requestId: approveRequestId, phoneNumber })
          }
          isPending={approveMutation.isPending}
        />
      )}

      {rejectRequestId && (
        <RejectVoiceAgentModal
          requestId={rejectRequestId}
          isOpen={!!rejectRequestId}
          onClose={() => setRejectRequestId(null)}
          onReject={(reason) => rejectMutation.mutate({ requestId: rejectRequestId, reason })}
          isPending={rejectMutation.isPending}
        />
      )}
    </div>
  )
}

