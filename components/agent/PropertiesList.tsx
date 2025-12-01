// components/agent/PropertiesList.tsx
'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Filter, Building, X, CheckCircle, XCircle, MapPin, Home } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import PageTransition from '@/components/common/PageTransition'
import PropertyCard from './PropertyCard'
import PropertyDetailsSheet from './PropertyDetailsSheet'
import { useMyProperties } from '@/hooks/useAgent'
import { useDebounce } from '@/hooks/useDebounce'
import { useRouter } from 'next/navigation'

export default function PropertiesList() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    property_type: '',
    city: '',
    is_available: '',
    contact_id: '',
  })
  const [page, setPage] = useState(1)
  const pageSize = 16
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading, error } = useMyProperties({
    search: debouncedSearch || undefined,
    property_type: filters.property_type || undefined,
    city: filters.city || undefined,
    is_available: filters.is_available ? filters.is_available === 'true' : undefined,
    contact_id: filters.contact_id || undefined,
    page,
    page_size: pageSize,
  })

  const properties = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // Extract unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const types = new Set<string>()
    const cities = new Set<string>()
    
    properties.forEach(p => {
      if (p.property_type) types.add(p.property_type)
      if (p.city) cities.add(p.city)
    })
    
    return {
      types: Array.from(types).sort(),
      cities: Array.from(cities).sort(),
    }
  }, [properties])

  const clearFilters = () => {
    setSearch('')
    setFilters({ property_type: '', city: '', is_available: '', contact_id: '' })
    setPage(1)
  }

  const hasActiveFilters = search || filters.property_type || filters.city || filters.is_available

  // Stats
  const availableCount = properties.filter(p => p.is_available === 'true').length
  const unavailableCount = properties.filter(p => p.is_available === 'false').length
  const withContactCount = properties.filter(p => p.contact_id).length

  if (error) return <ErrorMessage message={(error as Error).message} />

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-full">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Properties</h1>
              <p className="text-gray-400 mt-1">
                {total} propert{total !== 1 ? 'ies' : 'y'} in your inventory
              </p>
            </div>
            <button
              onClick={() => router.push('/agent/properties/new')}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-5 py-3 rounded-lg transition-all"
            >
              <Plus className="size-5" />
              Add Property
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by address, city, or state..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 border rounded-lg transition-all ${
                  showFilters || hasActiveFilters
                    ? 'border-blue-600 bg-blue-900/20 text-blue-400'
                    : 'border-gray-700 hover:border-gray-600 text-gray-300'
                }`}
              >
                <Filter className="size-5" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Property Type */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Property Type</label>
                    <select
                      value={filters.property_type}
                      onChange={(e) => setFilters(f => ({ ...f, property_type: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-600"
                    >
                      <option value="">All Types</option>
                      {filterOptions.types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">City</label>
                    <select
                      value={filters.city}
                      onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-600"
                    >
                      <option value="">All Cities</option>
                      {filterOptions.cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                    <select
                      value={filters.is_available}
                      onChange={(e) => setFilters(f => ({ ...f, is_available: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-600"
                    >
                      <option value="">All Status</option>
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="size-4" />
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Building className="size-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{properties.length}</p>
                  <p className="text-xs text-gray-500">Total Properties</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <CheckCircle className="size-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{availableCount}</p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <XCircle className="size-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{unavailableCount}</p>
                  <p className="text-xs text-gray-500">Unavailable</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <MapPin className="size-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{filterOptions.cities.length}</p>
                  <p className="text-xs text-gray-500">Cities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <LoadingSpinner />
          ) : properties.length === 0 ? (
            <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-xl">
              <Building className="size-20 text-gray-700 mx-auto mb-6" />
              <h3 className="text-xl text-gray-400 font-medium mb-2">No properties found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search query'
                  : 'Upload a CSV document or add properties manually'}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/agent/documents/upload')}
                  className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-all"
                >
                  Upload CSV
                </button>
                <button
                  onClick={() => router.push('/agent/properties/new')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all"
                >
                  <Plus className="size-5" />
                  Add Property
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                {properties.map((prop, i) => (
                  <div 
                    key={prop.id} 
                    className="opacity-0 animate-fadeIn" 
                    style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
                  >
                    <PropertyCard
                      property={prop}
                      onViewDetails={(id) => {
                        setSelectedPropertyId(id)
                        setIsDetailsSheetOpen(true)
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Showing{' '}
                    <span className="font-semibold text-gray-300">
                      {(page - 1) * pageSize + 1}–
                      {Math.min(page * pageSize, total)}
                    </span>{' '}
                    of <span className="font-semibold text-gray-300">{total}</span> properties
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-700 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-600 hover:text-white transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-400">
                      Page <span className="font-semibold text-gray-200">{page}</span> of{' '}
                      <span className="font-semibold text-gray-200">{totalPages}</span>
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-700 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-600 hover:text-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Property Details Side Sheet */}
          <PropertyDetailsSheet
            isOpen={isDetailsSheetOpen}
            propertyId={selectedPropertyId}
            onClose={() => {
              setIsDetailsSheetOpen(false)
              setTimeout(() => setSelectedPropertyId(null), 200)
            }}
          />
        </div>
      </div>
    </PageTransition>
  )
}
