'use client'

import VoiceAgentRequestForm from '@/components/agent/VoiceAgentRequestForm'
import PageTransition from '@/components/common/PageTransition'

export default function VoiceAgentRequestPage() {
  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2">Request Voice Agent</h1>
            <p className="text-gray-400">Get your AI-powered calling assistant</p>
          </div>
          <VoiceAgentRequestForm />
        </div>
      </div>
    </PageTransition>
  )
}

