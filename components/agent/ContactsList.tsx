// components/agent/ContactsList.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, Phone, Users } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import ContactCard from './ContactCard'
import { useMyContacts } from '@/hooks/useAgent'
import { useDebounce } from '@/hooks/useDebounce'

export default function ContactsList() {
  const [search, setSearch] = useState('')
  const [hasProperties, setHasProperties] = useState<boolean | undefined>(undefined)
  const debouncedSearch = useDebounce(search, 500)

  const { data: contacts = [], isLoading, error } = useMyContacts(
    debouncedSearch || undefined,
    hasProperties
  )

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={(error as Error).message} />

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-white">Contacts</h1>
            <button
              onClick={() => window.location.href = '/agent/contacts/new'}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-all"
            >
              <Plus className="size-5" />
              Add Contact
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
            </div>
            <select
              value={hasProperties === undefined ? '' : hasProperties ? 'true' : 'false'}
              onChange={(e) => setHasProperties(e.target.value === '' ? undefined : e.target.value === 'true')}
              className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-gray-600"
            >
              <option value="">All Contacts</option>
              <option value="true">With Properties</option>
              <option value="false">Without Properties</option>
            </select>
          </div>

          {/* Contacts Grid */}
          {contacts.length === 0 ? (
            <div className="text-center py-16">
              <Users className="size-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No contacts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contacts.map((contact, i) => (
                <div
                  key={contact.id}
                  className="opacity-0 animate-fadeIn"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <ContactCard
                    contact={contact}
                    onViewDetails={() => window.location.href = `/agent/contacts/${contact.id}`}
                    onCall={() => console.log('Call', contact.phone_number)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}