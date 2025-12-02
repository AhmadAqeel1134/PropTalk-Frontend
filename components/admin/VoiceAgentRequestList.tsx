'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVoiceAgentRequests, approveVoiceAgentRequest, rejectVoiceAgentRequest } from '@/lib/api'
import { Clock, CheckCircle, XCircle, User, Mail, Calendar, AlertCircle } from 'lucide-react'
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
  voice_agent_id?: string | null
  voice_agent_phone_number?: string | null
}

export default function VoiceAgentRequestList() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [approveRequestId, setApproveRequestId] = useState<string | null>(null)
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ items: VoiceAgentRequest[], total: number }>({
    queryKey: ['voice-agent-requests', statusFilter],
    queryFn: () => getVoiceAgentRequests(statusFilter)
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
      <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-300">Filter by status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Requests Grid */}
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-lg">
          <AlertCircle className="size-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Requests Found</h3>
          <p className="text-gray-400">
            {statusFilter === 'pending' 
              ? 'No pending voice agent requests' 
              : `No ${statusFilter} requests`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request, index) => {
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
                className="rounded-xl bg-gray-900 border border-gray-800 p-6 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20 hover:border-gray-700 opacity-0 animate-in card-pop-in duration-500"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 ${config.bg} ${config.border} border`}>
                  <Icon className={config.color} size={16} />
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                </div>

                {/* Agent & Voice Agent Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="text-gray-400" size={16} />
                    <span className="text-white font-medium">
                      {request.agent_name || 'Unknown agent'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="text-gray-400" size={16} />
                    <span className="text-gray-400 text-sm">
                      {request.agent_email || 'Email not available'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-gray-400" size={16} />
                    <span className="text-gray-400 text-sm">
                      Requested on {new Date(request.requested_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* For approved requests, surface the assigned voice agent number if we have it */}
                  {request.status === 'approved' && request.voice_agent_phone_number && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Assigned Voice Agent Number
                      </p>
                      <p className="text-sm font-medium text-white">
                        {request.voice_agent_phone_number}
                      </p>
                    </div>
                  )}
                </div>

                {/* Rejection Reason */}
                {request.status === 'rejected' && request.rejection_reason && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-red-400 font-medium mb-1">Rejection Reason:</p>
                    <p className="text-sm text-gray-300">{request.rejection_reason}</p>
                  </div>
                )}

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setApproveRequestId(request.id)}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-all text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectRequestId(request.id)}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-all text-sm font-medium"
                    >
                      Reject
                    </button>
                  </div>
                )}
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

