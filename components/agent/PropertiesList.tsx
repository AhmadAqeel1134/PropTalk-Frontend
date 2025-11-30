// components/agent/PropertiesList.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, Filter, Building } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import PropertyCard from './PropertyCard'
import { useMyProperties } from '@/hooks/useAgent'
import { useDebounce } from '@/hooks/useDebounce'

export default function PropertiesList() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ property_type: '', city: '', is_available: '', contact_id: '' })
  const debouncedSearch = useDebounce(search, 500)

  const { data: properties = [], isLoading, error } = useMyProperties({
    search: debouncedSearch || undefined,
    property_type: filters.property_type || undefined,
    city: filters.city || undefined,
    is_available: filters.is_available ? filters.is_available === 'true' : undefined,
    contact_id: filters.contact_id || undefined,
  })

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-white">Properties</h1>
            <button
              onClick={() => window.location.href = '/agent/properties/new'}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-all"
            >
              <Plus className="size-5" />
              Add Property
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by address or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
            </div>
            <button className="flex items-center gap-2 px-5 py-3 border border-gray-700 hover:border-gray-600 rounded-lg text-gray-300">
              <Filter className="size-5" />
              Filters
            </button>
          </div>

          {isLoading ? <LoadingSpinner /> : error ? <ErrorMessage message={(error as Error).message} /> : properties.length === 0 ? (
            <div className="text-center py-16">
              <Building className="size-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No properties found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((prop, i) => (
                <div key={prop.id} className="opacity-0 animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
                  <PropertyCard
                    property={prop}
                    onViewDetails={(id) => window.location.href = `/agent/properties/${id}`}
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