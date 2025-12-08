'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVoiceAgentRequests, approveVoiceAgentRequest, rejectVoiceAgentRequest } from '@/lib/api'
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
        <label className="text-sm font-medium text-gray-300">Filter by Status:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === 'all'
                ? 'bg-gray-800 border border-gray-600 text-white'
                : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === 'pending'
                ? 'bg-gray-800 border border-gray-600 text-white'
                : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === 'approved'
                ? 'bg-gray-800 border border-gray-600 text-white'
                : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === 'rejected'
                ? 'bg-gray-800 border border-gray-600 text-white'
                : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <AlertCircle className="size-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Requests Found</h3>
          <p className="text-gray-400">
            {statusFilter === 'pending' 
              ? 'No pending voice agent requests' 
              : statusFilter === 'all'
              ? 'No voice agent requests'
              : `No ${statusFilter} requests`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {requests.map((request) => {
            const statusConfig = {
              pending: {
                icon: Clock,
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/30',
                label: 'Pending'
              },
              approved: {
                icon: CheckCircle,
                color: 'text-green-400',
                bg: 'bg-green-500/10',
                border: 'border-green-500/30',
                label: 'Approved'
              },
              rejected: {
                icon: XCircle,
                color: 'text-red-400',
                bg: 'bg-red-500/10',
                border: 'border-red-500/30',
                label: 'Rejected'
              }
            }

            const config = statusConfig[request.status]
            const Icon = config.icon

            return (
              <div
                key={request.id}
                className="p-6 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 flex flex-col aspect-square"
                style={{ minHeight: '320px' }}
              >
                {/* Request Info */}
                <div className="flex-1 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-white truncate">{request.agent_name || 'Unknown Agent'}</h3>
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ${config.bg} ${config.border} border`}>
                          <Icon className={config.color} size={14} />
                          <span className={config.color}>{config.label}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-2 truncate" title={request.agent_email || 'N/A'}>
                        {request.agent_email || 'N/A'}
                      </p>
                      {request.agent_company_name && (
                        <p className="text-sm text-gray-500 truncate" title={request.agent_company_name}>
                          {request.agent_company_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid - Same as verification sheet */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div className="flex flex-col items-center text-center">
                      <Building size={20} className="text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Properties</p>
                      <p className="text-lg font-semibold text-white">{request.agent_stats?.properties_count ?? 0}</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <FileText size={20} className="text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Documents</p>
                      <p className="text-lg font-semibold text-white">{request.agent_stats?.documents_count ?? 0}</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <User size={20} className="text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Contacts</p>
                      <p className="text-lg font-semibold text-white">{request.agent_stats?.contacts_count ?? 0}</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <Phone size={20} className={`mb-2 ${request.agent_stats?.has_phone_number ? 'text-green-400' : 'text-gray-400'}`} />
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-lg font-semibold text-white">
                        {request.agent_stats?.has_phone_number ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-xs text-red-400 font-medium mb-1">Rejection Reason:</p>
                      <p className="text-sm text-gray-300 line-clamp-2">{request.rejection_reason}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto">
                  {request.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApproveRequestId(request.id)}
                        className="flex-1 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 hover:border-gray-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => setRejectRequestId(request.id)}
                        className="flex-1 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 hover:border-gray-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : request.status === 'approved' ? (
                    <div className="w-full px-4 py-3 rounded-lg text-sm font-medium text-green-400 bg-green-400/10 border border-green-400/20 flex items-center justify-center gap-2">
                      <CheckCircle size={18} />
                      <span>Approved</span>
                    </div>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 flex items-center justify-center gap-2">
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

