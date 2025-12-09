// components/agent/ContactsList.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Users, Phone, Building, Filter, X, TrendingUp } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import ContactCard from './ContactCard'
import BatchCallButton from './BatchCallButton'
import ContactDetailsSheet from './ContactDetailsSheet'
import { useMyContacts, useDeleteContact } from '@/hooks/useAgent'
import { useDebounce } from '@/hooks/useDebounce'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export default function ContactsList() {
  const { theme } = useTheme()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterHasProperties, setFilterHasProperties] = useState<string>('')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const debouncedSearch = useDebounce(search, 500)
  const deleteMutation = useDeleteContact()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Convert filter string to boolean or undefined
  const hasProperties = filterHasProperties === '' 
    ? undefined 
    : filterHasProperties === 'true'

  const { data: contacts = [], isLoading, error } = useMyContacts(
    debouncedSearch || undefined,
    hasProperties
  )

  // Filter contacts with phone numbers for calling (all should have phone numbers)
  const callableContacts = contacts.filter(c => c.phone_number)

  const clearFilters = () => {
    setSearch('')
    setFilterHasProperties('')
  }

  const hasActiveFilters = search || filterHasProperties

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={(error as Error).message} />

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
          {/* Enhanced Header */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div
              className={`rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50'
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-xl border ${
                        theme === 'dark'
                          ? 'bg-gray-800/60 border-gray-700/50'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <Users size={24} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
                    </div>
                    <div>
                      <h1 className={`text-3xl md:text-4xl font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Contacts
                      </h1>
                      <p className={`text-sm md:text-base ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {contacts.length} contact{contacts.length !== 1 ? 's' : ''} • Your target audience for calling campaigns
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {callableContacts.length > 0 && (
                    <BatchCallButton 
                      contacts={callableContacts.map(c => ({
                        id: c.id,
                        name: c.name,
                        phone_number: c.phone_number
                      }))}
                    />
                  )}
                  <button
                    onClick={() => router.push('/agent/contacts/new')}
                    className={`flex items-center gap-2 border px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                      theme === 'dark'
                        ? 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-sm'
                    }`}
                  >
                    <Plus size={18} />
                    Add Contact
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search & Filters */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div
              className={`rounded-2xl p-5 backdrop-blur-sm shadow-xl ${
                theme === 'dark'
                  ? 'bg-gray-900/60 border border-gray-800/50'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-800/60 border-gray-700/50 text-white focus:border-gray-600'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-400 shadow-sm'
                    }`}
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-5 py-3 border-2 rounded-xl transition-all duration-200 ${
                    showFilters || hasActiveFilters
                      ? theme === 'dark'
                        ? 'border-blue-600 bg-blue-900/20 text-blue-400'
                        : 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : theme === 'dark'
                      ? 'border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white'
                      : 'border-gray-200 hover:border-blue-400 text-gray-600 hover:text-blue-700 shadow-sm'
                  }`}
                >
                  <Filter className="size-5" />
                  Filters
                  {hasActiveFilters && (
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
                    }`} />
                  )}
                </button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className={`mt-4 pt-4 border-t ${
                  theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200'
                }`}>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className={`block text-sm mb-2 font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Property Status
                      </label>
                      <select
                        value={filterHasProperties}
                        onChange={(e) => setFilterHasProperties(e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-800/60 border-gray-700/50 text-white focus:border-gray-600'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-400 shadow-sm'
                        }`}
                      >
                        <option value="">All Contacts</option>
                        <option value="true">With Properties</option>
                        <option value="false">Without Properties</option>
                      </select>
                    </div>
                    
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className={`flex items-center gap-2 px-4 py-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-gray-400 hover:text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <X className="size-4" />
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Stats Bar */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            {[
              { icon: Users, label: 'Total Contacts', value: contacts.length, color: 'blue-400', delay: '0ms' },
              { icon: Phone, label: 'Ready to Call', value: callableContacts.length, color: 'emerald-400', delay: '50ms' },
              { icon: Building, label: 'With Properties', value: contacts.filter(c => c.properties_count > 0).length, color: 'purple-400', delay: '100ms' },
              { icon: TrendingUp, label: 'Total Properties', value: contacts.reduce((sum, c) => sum + (c.properties_count || 0), 0), color: 'orange-400', delay: '150ms' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`border-2 rounded-xl p-5 backdrop-blur-sm shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-gray-800/50 hover:border-gray-700'
                    : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
                } ${
                  isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: stat.delay }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-800/60 border-gray-700/50'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <stat.icon className={`size-5 text-${stat.color}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </p>
                    <p className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contacts Grid with Staggered Animation */}
          {contacts.length === 0 ? (
            <div
              className={`text-center py-20 border-2 rounded-2xl backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-gray-800/50'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <Users className={`size-20 mx-auto mb-6 ${
                theme === 'dark' ? 'text-gray-700' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No contacts found
              </h3>
              <p className={`mb-8 max-w-md mx-auto ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search query'
                  : 'Upload a CSV document or add contacts manually to build your audience'}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/agent/documents/upload')}
                  className={`flex items-center gap-2 border-2 px-6 py-3 rounded-xl transition-all font-semibold ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white'
                      : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-700 shadow-sm'
                  }`}
                >
                  Upload CSV
                </button>
                <button
                  onClick={() => router.push('/agent/contacts/new')}
                  className={`flex items-center gap-2 border px-6 py-3 rounded-xl transition-all font-semibold shadow-lg ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-sm'
                  }`}
                >
                  <Plus className="size-5" />
                  Add Contact
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contacts.map((contact, i) => (
                <div
                  key={contact.id}
                  className={`transition-all duration-700 ease-out ${
                    isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${Math.min(i * 100, 1000)}ms`,
                    animation: isMounted ? `fadeInUp 0.7s ease-out ${Math.min(i * 100, 1000)}ms both` : 'none'
                  }}
                >
                  <ContactCard
                    contact={contact}
                    onViewDetails={(id) => {
                      setSelectedContactId(id)
                      setIsDetailsSheetOpen(true)
                    }}
                    onCall={() => console.log('Initiating call to:', contact.id)}
                    onDelete={(id) => {
                      if (deleteMutation.isPending) return
                      if (confirm('Are you sure you want to delete this contact? Properties linked to this contact will be unlinked but not deleted.')) {
                        deleteMutation.mutate(id)
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Contact Details Side Sheet */}
          <ContactDetailsSheet
            isOpen={isDetailsSheetOpen}
            contactId={selectedContactId}
            onClose={() => {
              setIsDetailsSheetOpen(false)
              setTimeout(() => setSelectedContactId(null), 200)
            }}
          />
        </div>
      </div>
    </PageTransition>
  )
}
