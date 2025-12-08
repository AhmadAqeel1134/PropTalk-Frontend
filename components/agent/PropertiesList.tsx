// components/agent/PropertiesList.tsx
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Filter, Building, X, CheckCircle, XCircle, MapPin, Home, TrendingUp } from 'lucide-react'
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
  const [isMounted, setIsMounted] = useState(false)
  const pageSize = 16
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
          {/* Enhanced Header */}
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gray-800/60 border border-gray-700/50">
                      <Building size={24} className="text-gray-300" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                        Properties
                      </h1>
                      <p className="text-gray-400 text-sm md:text-base">
                        {total} propert{total !== 1 ? 'ies' : 'y'} in your inventory
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/agent/properties/new')}
                  className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} />
                  Add Property
                </button>
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
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by address, city, or state..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border-2 border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-all duration-200"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-5 py-3 border-2 rounded-xl transition-all duration-200 ${
                    showFilters || hasActiveFilters
                      ? 'border-blue-600 bg-blue-900/20 text-blue-400'
                      : 'border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white'
                  }`}
                >
                  <Filter className="size-5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Property Type */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-medium">Property Type</label>
                      <select
                        value={filters.property_type}
                        onChange={(e) => setFilters(f => ({ ...f, property_type: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-gray-600 transition-all"
                      >
                        <option value="">All Types</option>
                        {filterOptions.types.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-medium">City</label>
                      <select
                        value={filters.city}
                        onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-gray-600 transition-all"
                      >
                        <option value="">All Cities</option>
                        {filterOptions.cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-medium">Status</label>
                      <select
                        value={filters.is_available}
                        onChange={(e) => setFilters(f => ({ ...f, is_available: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-gray-600 transition-all"
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
          </div>

          {/* Enhanced Stats Bar */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-500 ease-out ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            {[
              { icon: Building, label: 'Total Properties', value: properties.length, color: 'blue-400', delay: '0ms' },
              { icon: CheckCircle, label: 'Available', value: availableCount, color: 'green-400', delay: '50ms' },
              { icon: XCircle, label: 'Unavailable', value: unavailableCount, color: 'red-400', delay: '100ms' },
              { icon: MapPin, label: 'Cities', value: filterOptions.cities.length, color: 'purple-400', delay: '150ms' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-2 border-gray-800/50 rounded-xl p-5 backdrop-blur-sm shadow-xl hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 ${
                  isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: stat.delay }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 bg-gray-800/60 border border-gray-700/50 rounded-lg`}>
                    <stat.icon className={`size-5 text-${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Properties Grid with Staggered Animation */}
          {isLoading ? (
            <LoadingSpinner />
          ) : properties.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-2 border-gray-800/50 rounded-2xl backdrop-blur-sm">
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
                  className="flex items-center gap-2 bg-gray-800/60 border-2 border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-xl transition-all font-semibold"
                >
                  Upload CSV
                </button>
                <button
                  onClick={() => router.push('/agent/properties/new')}
                  className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800 px-6 py-3 rounded-xl transition-all font-semibold shadow-lg"
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
                    className={`transition-all duration-700 ease-out ${
                      isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                    }`}
                    style={{ 
                      transitionDelay: `${Math.min(i * 100, 1000)}ms`,
                      animation: isMounted ? `fadeInUp 0.7s ease-out ${Math.min(i * 100, 1000)}ms both` : 'none'
                    }}
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
                <div className="flex items-center justify-between mt-2 p-4 bg-gray-900/60 border-2 border-gray-800/50 rounded-xl">
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
                      className="px-4 py-2 text-sm rounded-xl border-2 border-gray-700/50 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-600 hover:text-white transition-all font-semibold"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-400 px-3">
                      Page <span className="font-semibold text-gray-200">{page}</span> of{' '}
                      <span className="font-semibold text-gray-200">{totalPages}</span>
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 text-sm rounded-xl border-2 border-gray-700/50 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-600 hover:text-white transition-all font-semibold"
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
