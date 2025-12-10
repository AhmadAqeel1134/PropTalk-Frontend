'use client'

import VoiceAgentRequestCard from '@/components/agent/VoiceAgentRequestCard'
import VoiceAgentStatusCard from '@/components/agent/VoiceAgentStatusCard'
import VoiceAgentConfigurationSheet from '@/components/agent/VoiceAgentConfigurationSheet'
import CallHistoryList from '@/components/agent/CallHistoryList'
import CallInitiationModal from '@/components/agent/CallInitiationModal'
import CallDetailsSheet from '@/components/twilio/CallDetailsSheet'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, Settings, History } from 'lucide-react'
import PageTransition from '@/components/common/PageTransition'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useTheme } from '@/contexts/ThemeContext'

export default function VoiceAgentPage() {
  const { theme } = useTheme()
  const [showConfigSheet, setShowConfigSheet] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)

  // Check if agent has voice agent request
  const { data: voiceAgentRequest, isLoading: loadingRequest } = useQuery({
    queryKey: ['voice-agent-status'],
    queryFn: async () => {
      try {
        const { getVoiceAgentStatus } = await import('@/lib/real_estate_agent/api')
        return await getVoiceAgentStatus()
      } catch (error: any) {
        if (error?.response?.status === 404) return null
        throw error
      }
    },
    retry: false
  })

  // Check if agent has active voice agent
  const { data: voiceAgent, isLoading: loadingAgent } = useQuery({
    queryKey: ['voice-agent'],
    queryFn: async () => {
      try {
        const { getVoiceAgent } = await import('@/lib/real_estate_agent/api')
        return await getVoiceAgent()
      } catch (error: any) {
        if (error?.response?.status === 404) return null
        throw error
      }
    },
    retry: false,
    enabled: voiceAgentRequest?.status === 'approved'
  })

  if (loadingRequest || loadingAgent) {
    return (
      <PageTransition>
        <div
          className="min-h-screen p-6 md:p-8"
          style={
            theme === 'dark'
              ? { background: 'rgba(10, 15, 25, 0.95)' }
              : { background: 'rgba(248, 250, 252, 0.98)' }
          }
        >
          <LoadingSpinner />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div
        className="min-h-screen p-6 md:p-8"
        style={
          theme === 'dark'
            ? { background: 'rgba(10, 15, 25, 0.95)' }
            : { background: 'rgba(248, 250, 252, 0.98)' }
        }
      >
        <div className="max-w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-3xl md:text-4xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Voice Agent
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Manage your AI-powered calling assistant
              </p>
            </div>
            {voiceAgent && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCallModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-lg transition-all"
                >
                  <Phone className="size-5" />
                  Initiate Call
                </button>
                <button
                  onClick={() => setShowConfigSheet(true)}
                  className={`flex items-center gap-2 border px-6 py-3 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                      : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-700 shadow-sm'
                  }`}
                >
                  <Settings className="size-5" />
                  Configure
                </button>
              </div>
            )}
          </div>

          {/* Voice Agent Status or Request Card */}
          <div className="mb-8">
            {voiceAgent ? (
              <VoiceAgentStatusCard onConfigure={() => setShowConfigSheet(true)} />
            ) : voiceAgentRequest ? (
              <VoiceAgentRequestCard />
            ) : (
              <div
                className={`border rounded-lg p-8 text-center ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <Phone className={`size-16 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  No Voice Agent
                </h3>
                <p className={`mb-6 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Request a voice agent to start automating your calls
                </p>
                <button
                  onClick={() => window.location.href = '/agent/voice-agent/request'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-lg transition-all"
                >
                  Request Voice Agent
                </button>
              </div>
            )}
          </div>

          {/* Call History */}
          {voiceAgent && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-semibold flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <History className="size-6" />
                  Call History
                </h2>
              </div>
              <CallHistoryList
                onViewDetails={(id) => setSelectedCallId(id)}
                onListen={(id) => setSelectedCallId(id)}
                hideTranscriptIconButton
                disableActionsOnNoAnswer
                forceActionsVisibleOnNoAnswer
                enforceUniformHeight
              />
            </div>
          )}

          {/* Configuration Sheet */}
          {voiceAgent && (
            <VoiceAgentConfigurationSheet
              isOpen={showConfigSheet}
              onClose={() => setShowConfigSheet(false)}
            />
          )}

          {/* Call Initiation Modal */}
          {voiceAgent && (
            <CallInitiationModal
              isOpen={showCallModal}
              onClose={() => setShowCallModal(false)}
              onSuccess={() => {
                setShowCallModal(false)
                // Refresh call history
                window.location.reload()
              }}
            />
          )}

          {/* Call Details Sheet */}
          {selectedCallId && (
            <CallDetailsSheet
              callId={selectedCallId}
              isOpen={!!selectedCallId}
              onClose={() => setSelectedCallId(null)}
            />
          )}
        </div>
      </div>
    </PageTransition>
  )
}

