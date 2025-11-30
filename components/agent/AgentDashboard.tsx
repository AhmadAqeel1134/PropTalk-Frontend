// components/agent/AgentDashboard.tsx
'use client'

import { Building, FileText, Phone, Users, CheckCircle, XCircle, Plus, Upload, UserPlus } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import { useAgentDashboard } from '@/hooks/useAgent'

export default function AgentDashboard() {
  const { data: dashboard, isLoading, error } = useAgentDashboard()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={(error as Error).message} />

  const stats = [
    { label: 'Total Properties', value: dashboard.total_properties, icon: Building },
    { label: 'Available', value: dashboard.available_properties, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Unavailable', value: dashboard.unavailable_properties, icon: XCircle, color: 'text-red-400' },
    { label: 'Documents', value: dashboard.total_documents, icon: FileText },
    { label: 'Contacts', value: dashboard.total_contacts, icon: Users },
    { label: 'With Properties', value: dashboard.contacts_with_properties, icon: UserPlus },
  ]

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-full">
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-8">Agent Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`size-8 ${stat.color || 'text-gray-400'}`} />
                  {stat.label === 'Phone' && (
                    dashboard.has_phone_number ? 
                      <CheckCircle className="size-6 text-green-400" /> : 
                      <XCircle className="size-6 text-red-400" />
                  )}
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Verification & Phone Status */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${dashboard.is_verified ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {dashboard.is_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            {dashboard.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-gray-400" />
                <span className="text-sm text-gray-400">{dashboard.phone_number}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button
              onClick={() => window.location.href = '/agent/documents/upload'}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-all"
            >
              <Upload className="size-5" />
              Upload Document
            </button>
            <button
              onClick={() => window.location.href = '/agent/contacts/new'}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-all"
            >
              <UserPlus className="size-5" />
              Add Contact
            </button>
            <button
              onClick={() => window.location.href = '/agent/contacts'}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-all"
            >
              <Users className="size-5" />
              View All Contacts
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 gap-8">
            {/* Recent Properties */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Recent Properties</h3>
              {dashboard.recent_properties.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No properties yet</p>
              ) : (
                <div className="space-y-4">
                  {dashboard.recent_properties.slice(0, 5).map((prop, i) => (
                    <div key={prop.id} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0" style={{ animationDelay: `${i * 100}ms` }}>
                      <div>
                        <p className="text-white font-medium">{prop.address}</p>
                        <p className="text-sm text-gray-500">{prop.city} • {prop.property_type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${prop.is_available === 'true' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {prop.is_available === 'true' ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Contacts */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Recent Contacts</h3>
              {dashboard.recent_contacts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No contacts yet</p>
              ) : (
                <div className="space-y-4">
                  {dashboard.recent_contacts.slice(0, 5).map((contact, i) => (
                    <div key={contact.id} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0" style={{ animationDelay: `${i * 100}ms` }}>
                      <div>
                        <p className="text-white font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.phone_number}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(contact.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}