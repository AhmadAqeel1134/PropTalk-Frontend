// components/agent/AgentProfile.tsx
'use client'

import { useState } from 'react'
import { User, Mail, Phone, Building, MapPin } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import { useAgentProfile } from '@/hooks/useAgent'
import EditProfileForm from './EditProfileForm'
import ChangePasswordForm from './ChangePasswordForm'

export default function AgentProfile() {
  const { data: profile, isLoading, error } = useAgentProfile()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

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