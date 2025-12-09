// components/agent/PropertyCard.tsx
'use client'

import { Bed, Bath, Square, MapPin, DollarSign, Home } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface PropertyCardProps {
  property: {
    id: string
    address: string
    city: string | null
    property_type: string | null
    price: string | null
    bedrooms: number | null
    bathrooms: number | null
    square_feet: number | null
    is_available: string
    contact_id: string | null
  }
  onViewDetails: (id: string) => void
  onEdit?: (id: string) => void
}

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const { theme } = useTheme()
  return (
    <div
      className={`group relative border-2 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900/90 to-gray-950/90 border-gray-800/50 hover:border-gray-600 hover:shadow-2xl hover:shadow-black/40'
          : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl shadow-sm'
      }`}
    >
      {/* Top accent bar */}
      <div className={`h-1.5 ${
        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200'
      }`} />
      
      <div className="p-6">
        {/* Header with icon and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`p-2.5 rounded-xl border ${
                property.is_available === 'true'
                  ? theme === 'dark'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-green-100 border-green-300'
                  : theme === 'dark'
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-red-100 border-red-300'
              }`}
            >
              <Home
                className={`size-5 ${
                  property.is_available === 'true'
                    ? theme === 'dark'
                      ? 'text-green-400'
                      : 'text-green-600'
                    : theme === 'dark'
                    ? 'text-red-400'
                    : 'text-red-600'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold line-clamp-2 mb-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {property.address}
              </h3>
              <div className={`flex items-center gap-2 text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <MapPin className="size-3.5" />
                <span className="truncate">{property.city || 'N/A'}</span>
              </div>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ml-2 border ${
              property.is_available === 'true'
                ? theme === 'dark'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-green-100 border-green-300 text-green-700'
                : theme === 'dark'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-red-100 border-red-300 text-red-700'
            }`}
          >
            {property.is_available === 'true' ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Property type badge */}
        {property.property_type && (
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-medium rounded-lg ${
              theme === 'dark'
                ? 'bg-gray-800/60 border-gray-700/50 text-gray-300'
                : 'bg-gray-100 border-gray-200 text-gray-700'
            }`}>
              {property.property_type}
            </span>
          </div>
        )}

        {/* Features grid */}
        {(property.bedrooms || property.bathrooms || property.square_feet) && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {property.bedrooms && (
              <div
                className={`flex flex-col items-center p-2.5 border rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-800/40 border-gray-700/30'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Bed className={`size-4 mb-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-xs font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {property.bedrooms}
                </span>
                <span className={`text-[10px] ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  bed
                </span>
              </div>
            )}
            {property.bathrooms && (
              <div
                className={`flex flex-col items-center p-2.5 border rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-800/40 border-gray-700/30'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Bath className={`size-4 mb-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-xs font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {property.bathrooms}
                </span>
                <span className={`text-[10px] ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  bath
                </span>
              </div>
            )}
            {property.square_feet && (
              <div
                className={`flex flex-col items-center p-2.5 border rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-800/40 border-gray-700/30'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Square className={`size-4 mb-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-xs font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {property.square_feet}
                </span>
                <span className={`text-[10px] ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  sqft
                </span>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        {property.price && (
          <div
            className={`mb-5 p-3 border rounded-xl ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50'
                : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
            }`}
          >
            <p className={`text-2xl font-bold flex items-center gap-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <DollarSign className={`size-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              {property.price}
            </p>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={() => onViewDetails(property.id)}
          className={`w-full py-3 border-2 rounded-xl font-semibold transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800/60 border-gray-700/50 text-gray-300'
              : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-700 shadow-sm'
          }`}
        >
          View Details
        </button>
      </div>
    </div>
  )
}