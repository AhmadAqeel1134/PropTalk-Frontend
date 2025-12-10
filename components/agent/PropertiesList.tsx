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
import { useTheme } from '@/contexts/ThemeContext'

export default function PropertiesList() {
  const { theme } = useTheme()
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
                      <Building size={24} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
                    </div>
                    <div>
                      <h1 className={`text-3xl md:text-4xl font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Properties
                      </h1>
                      <p className={`text-sm md:text-base ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {total} propert{total !== 1 ? 'ies' : 'y'} in your inventory
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/agent/properties/new')}
                  className={`flex items-center gap-2 border px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-sm'
                  }`}
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
                    placeholder="Search by address, city, or state..."
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Property Type */}
                    <div>
                      <label className={`block text-sm mb-2 font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Property Type
                      </label>
                      <select
                        value={filters.property_type}
                        onChange={(e) => setFilters(f => ({ ...f, property_type: e.target.value }))}
                        className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-800/60 border-gray-700/50 text-white focus:border-gray-600'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-400 shadow-sm'
                        }`}
                      >
                        <option value="">All Types</option>
                        {filterOptions.types.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* City */}
                    <div>
                      <label className={`block text-sm mb-2 font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        City
                      </label>
                      <select
                        value={filters.city}
                        onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                        className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-800/60 border-gray-700/50 text-white focus:border-gray-600'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-400 shadow-sm'
                        }`}
                      >
                        <option value="">All Cities</option>
                        {filterOptions.cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Availability */}
                    <div>
                      <label className={`block text-sm mb-2 font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Status
                      </label>
                      <select
                        value={filters.is_available}
                        onChange={(e) => setFilters(f => ({ ...f, is_available: e.target.value }))}
                        className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-800/60 border-gray-700/50 text-white focus:border-gray-600'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-400 shadow-sm'
                        }`}
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
                          className={`flex items-center gap-2 px-4 py-2.5 transition-colors ${
                            theme === 'dark'
                              ? 'text-gray-400 hover:text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
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

          {/* Properties Grid with Staggered Animation */}
          {isLoading ? (
            <LoadingSpinner />
          ) : properties.length === 0 ? (
            <div
              className={`text-center py-20 border-2 rounded-2xl backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-900/60 to-gray-950/60 border-gray-800/50'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <Building className={`size-20 mx-auto mb-6 ${
                theme === 'dark' ? 'text-gray-700' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No properties found
              </h3>
              <p className={`mb-8 max-w-md mx-auto ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search query'
                  : 'Upload a CSV document or add properties manually'}
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
                  onClick={() => router.push('/agent/properties/new')}
                  className={`flex items-center gap-2 border px-6 py-3 rounded-xl transition-all font-semibold shadow-lg ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-sm'
                  }`}
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
                <div
                  className={`flex items-center justify-between mt-2 p-4 border-2 rounded-xl ${
                    theme === 'dark'
                      ? 'bg-gray-900/60 border-gray-800/50'
                      : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Showing{' '}
                    <span className={`font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {(page - 1) * pageSize + 1}–
                      {Math.min(page * pageSize, total)}
                    </span>{' '}
                    of <span className={`font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {total}
                    </span> properties
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={`px-4 py-2 text-sm rounded-xl border-2 transition-all font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${
                        theme === 'dark'
                          ? 'border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white'
                          : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 shadow-sm'
                      }`}
                    >
                      Previous
                    </button>
                    <span className={`text-xs px-3 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Page <span className={`font-semibold ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {page}
                      </span> of{' '}
                      <span className={`font-semibold ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {totalPages}
                      </span>
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={`px-4 py-2 text-sm rounded-xl border-2 transition-all font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${
                        theme === 'dark'
                          ? 'border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white'
                          : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 shadow-sm'
                      }`}
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
