// components/agent/AgentProfile.tsx
'use client'

import { useMemo, useState } from 'react'
import { User, Mail, Phone, Building, MapPin, PhoneCall, Waves, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import { useAgentProfile, useCallStatistics, useVoiceAgent, useUpdateVoiceAgent } from '@/hooks/useAgent'
import EditProfileForm from './EditProfileForm'
import ChangePasswordForm from './ChangePasswordForm'

export default function AgentProfile() {
  const { data: profile, isLoading, error } = useAgentProfile()
  const { data: voiceAgent } = useVoiceAgent()
  const [statsPeriod, setStatsPeriod] = useState<'day' | 'week' | 'month'>('week')
  const { data: callStats } = useCallStatistics(statsPeriod)
  const updateVoiceMutation = useUpdateVoiceAgent()
  const [voiceName, setVoiceName] = useState<string>(voiceAgent?.name || '')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Keep voice name synced when data loads
  useMemo(() => {
    if (voiceAgent?.name) setVoiceName(voiceAgent.name)
  }, [voiceAgent?.name])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={(error as Error).message} />

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-full">
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-8">My Profile</h1>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="size-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'Agent Name'}</h2>
                <p className="text-gray-400">{profile?.email}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-sm text-gray-400">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${profile?.is_verified ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {profile?.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-gray-500" />
                  <span className="text-gray-300">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-gray-500" />
                  <span className="text-gray-300">{profile?.phone || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="size-5 text-gray-500" />
                  <span className="text-gray-300">{profile?.company_name || 'Independent'}</span>
                </div>
                {profile?.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="size-5 text-gray-500" />
                    <span className="text-gray-300">{profile.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-6 py-3 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-all"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-6 py-3 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-all"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Voice Agent Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Voice Agent</h2>
                <p className="text-gray-400 text-sm">Manage your AI caller and see call volume</p>
              </div>
              {voiceAgent?.status && (
                <span className={`px-3 py-1 rounded-full text-xs border ${
                  voiceAgent.status === 'active'
                    ? 'bg-green-900/40 border-green-700 text-green-200'
                    : 'bg-gray-800 border-gray-700 text-gray-300'
                }`}>
                  {voiceAgent.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <PhoneCall className="size-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Voice Agent Name</p>
                    <div className="flex gap-2 mt-2">
                      <input
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors flex-1"
                        placeholder="e.g., Sarah (AI)"
                      />
                      <button
                        onClick={() => {
                          if (!voiceName.trim()) return
                          updateVoiceMutation.mutate({ name: voiceName.trim() })
                        }}
                        disabled={updateVoiceMutation.isPending}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-100 rounded-lg transition-all disabled:opacity-60"
                      >
                        {updateVoiceMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Waves className="size-5 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Prompt Mode</p>
                    <p className="text-white font-medium">
                      {voiceAgent?.use_default_prompt ? 'Default Prompt' : 'Custom Prompt'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-5 text-teal-400" />
                  <div className="flex gap-2">
                    {(['day','week','month'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setStatsPeriod(p)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                          statsPeriod === p
                            ? 'bg-gray-800 border-gray-600 text-white'
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        {p === 'day' ? 'Daily' : p === 'week' ? 'Weekly' : 'Monthly'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <StatPill
                    label="Total Calls"
                    value={callStats?.total_calls ?? 0}
                    tone="neutral"
                  />
                  <StatPill
                    label="Completed"
                    value={callStats?.completed_calls ?? 0}
                    tone="positive"
                  />
                  <StatPill
                    label="Failed/No Answer"
                    value={callStats?.failed_calls ?? 0}
                    tone="negative"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditingProfile && profile && (
          <EditProfileForm
            profile={profile}
            onClose={() => setIsEditingProfile(false)}
          />
        )}

        {isChangingPassword && (
          <ChangePasswordForm
            onClose={() => setIsChangingPassword(false)}
          />
        )}
      </div>
    </PageTransition>
  )
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: 'positive' | 'negative' | 'neutral' }) {
  const toneStyles =
    tone === 'positive'
      ? 'bg-green-900/30 border-green-700/50 text-green-200'
      : tone === 'negative'
      ? 'bg-red-900/30 border-red-700/50 text-red-200'
      : 'bg-gray-800 border-gray-700 text-gray-200'

  const icon =
    tone === 'positive' ? <CheckCircle2 className="size-4" /> :
    tone === 'negative' ? <XCircle className="size-4" /> : <TrendingUp className="size-4" />

  return (
    <div className={`flex flex-col gap-1 px-4 py-3 rounded-xl border ${toneStyles}`}>
      <div className="flex items-center gap-2 text-sm text-gray-300">{icon}{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  )
}