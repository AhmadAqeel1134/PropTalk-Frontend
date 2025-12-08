// components/agent/AgentDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { Building, FileText, Phone, Users, CheckCircle, XCircle, Upload, UserPlus, TrendingUp, RefreshCw, ShieldCheck } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import StatsCard from '@/components/common/StatsCard'
import { useAgentDashboard } from '@/hooks/useAgent'
import VoiceAgentRequestCard from './VoiceAgentRequestCard'
import VoiceAgentStatusCard from './VoiceAgentStatusCard'
import VoiceAgentRequestSheet from './VoiceAgentRequestSheet'
import { useQuery } from '@tanstack/react-query'

export default function AgentDashboard() {
  const { data: dashboard, isLoading, error, refetch, dataUpdatedAt, isFetching } = useAgentDashboard()
  const [isMounted, setIsMounted] = useState(false)
  const [isRequestSheetOpen, setIsRequestSheetOpen] = useState(false)
  
  // Check if agent has voice agent request or active voice agent
  const { data: voiceAgentRequest } = useQuery({
    queryKey: ['voice-agent-status'],
    queryFn: async () => {
      try {
        const { getVoiceAgentStatus } = await import('@/lib/real_estate_agent/api')
        return await getVoiceAgentStatus()
      } catch (error: any) {
        // If 404, agent hasn't requested yet
        if (error?.response?.status === 404) return null
        throw error
      }
    },
    retry: false
  })

  const { data: voiceAgent } = useQuery({
    queryKey: ['voice-agent'],
    queryFn: async () => {
      try {
        const { getVoiceAgent } = await import('@/lib/real_estate_agent/api')
        return await getVoiceAgent()
      } catch (error: any) {
        // If 404, agent doesn't have voice agent yet
        if (error?.response?.status === 404) return null
        throw error
      }
    },
    retry: false,
    enabled: voiceAgentRequest?.status === 'approved'
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (isLoading) return <LoadingSpinner text="Loading dashboard..." fullScreen />
  if (error) return <ErrorMessage message={(error as Error).message} fullScreen />

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-full">
          {/* Header Section with Enhanced Design */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gray-800/60 border border-gray-700/50">
                      <TrendingUp size={24} className="text-gray-300" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                        Agent Dashboard
                      </h1>
                      <p className="text-gray-400 text-sm md:text-base">
                        Your Portfolio Overview & Statistics
                      </p>
                    </div>
                  </div>
                  {dataUpdatedAt && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-2 h-2 rounded-full bg-green-400/60 animate-pulse"></div>
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    title="Refresh data"
                  >
                    <RefreshCw size={20} className={isFetching ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status Section - Moved to Top */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/50">
                <div className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
                  <ShieldCheck size={20} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-white">Account Status</h2>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 font-medium">Verification Status:</span>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    dashboard.is_verified 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {dashboard.is_verified ? (
                      <>
                        <CheckCircle size={16} />
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span>Unverified</span>
                      </>
                    )}
                  </span>
                </div>
                {dashboard.phone_number && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 font-medium">Phone Number:</span>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-sm text-white font-medium">{dashboard.phone_number}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
                    <TrendingUp size={18} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => window.location.href = '/agent/documents/upload'}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-medium"
                  >
                    <Upload size={16} />
                    <span>Upload Document</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/agent/contacts/new'}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-medium"
                  >
                    <UserPlus size={16} />
                    <span>Add Contact</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/agent/contacts'}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-medium"
                  >
                    <Users size={16} />
                    <span>View Contacts</span>
                  </button>
                  {voiceAgent ? (
                    <button
                      onClick={() => window.location.href = '/agent/voice-agent'}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-medium"
                    >
                      <Phone size={16} />
                      <span>Voice Agent</span>
                    </button>
                  ) : !voiceAgentRequest && (
                    <button
                      onClick={() => setIsRequestSheetOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-medium"
                    >
                      <Phone size={16} />
                      <span>Request Voice Agent</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Voice Agent Status Section */}
          {(voiceAgent || voiceAgentRequest) && (
            <div
              className={`mb-8 transition-all duration-500 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/50">
                  <div className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
                    <Phone size={20} className="text-gray-300" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Voice Agent</h2>
                </div>
                {voiceAgent ? (
                  <VoiceAgentStatusCard />
                ) : (
                  <VoiceAgentRequestCard />
                )}
              </div>
            </div>
          )}

          {/* Properties Stats Section */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/50">
                <div className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
                  <Building size={20} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-white">Properties</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className={`transition-all duration-500 ease-out ${
                    isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '0ms' }}
                >
                  <StatsCard
                    title="Total Properties"
                    value={dashboard.total_properties}
                    icon={<Building size={20} />}
                  />
                </div>
                <div
                  className={`transition-all duration-500 ease-out ${
                    isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '50ms' }}
                >
                  <StatsCard
                    title="Available"
                    value={dashboard.available_properties}
                    icon={<CheckCircle size={20} />}
                  />
                </div>
                <div
                  className={`transition-all duration-500 ease-out ${
                    isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '100ms' }}
                >
                  <StatsCard
                    title="Unavailable"
                    value={dashboard.unavailable_properties}
                    icon={<XCircle size={20} />}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Documents & Contacts Stats Section */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/50">
                <div className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
                  <FileText size={20} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-white">Documents & Contacts</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`transition-all duration-500 ease-out ${
                    isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '250ms' }}
                >
                  <StatsCard
                    title="Total Documents"
                    value={dashboard.total_documents}
                    icon={<FileText size={20} />}
                    subtitle="Uploaded files"
                  />
                </div>
                <div
                  className={`transition-all duration-500 ease-out ${
                    isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '300ms' }}
                >
                  <StatsCard
                    title="Total Contacts"
                    value={dashboard.total_contacts}
                    icon={<Users size={20} />}
                    subtitle="All contacts"
                  />
                </div>
                <div
                  className={`transition-all duration-500 ease-out ${
                    isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '350ms' }}
                >
                  <StatsCard
                    title="With Properties"
                    value={dashboard.contacts_with_properties}
                    icon={<UserPlus size={20} />}
                    subtitle="Linked contacts"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Agent Request Side Sheet */}
      <VoiceAgentRequestSheet
        isOpen={isRequestSheetOpen}
        onClose={() => setIsRequestSheetOpen(false)}
      />
    </PageTransition>
  )
}
