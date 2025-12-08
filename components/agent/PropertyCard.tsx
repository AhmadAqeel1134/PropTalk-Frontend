// components/agent/PropertyCard.tsx
import { Bed, Bath, Square, MapPin, DollarSign, Home } from 'lucide-react'

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
  return (
    <div className="group relative bg-gradient-to-br from-gray-900/90 to-gray-950/90 border-2 border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-500 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gray-700/50" />
      
      <div className="p-6">
        {/* Header with icon and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2.5 rounded-xl ${property.is_available === 'true' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <Home className={`size-5 ${property.is_available === 'true' ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white line-clamp-2 mb-1">{property.address}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin className="size-3.5" />
                <span className="truncate">{property.city || 'N/A'}</span>
              </div>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ml-2 ${property.is_available === 'true' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {property.is_available === 'true' ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Property type badge */}
        {property.property_type && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/60 border border-gray-700/50 text-gray-300 text-xs font-medium rounded-lg">
              {property.property_type}
            </span>
          </div>
        )}

        {/* Features grid */}
        {(property.bedrooms || property.bathrooms || property.square_feet) && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {property.bedrooms && (
              <div className="flex flex-col items-center p-2.5 bg-gray-800/40 border border-gray-700/30 rounded-lg">
                <Bed className="size-4 text-gray-400 mb-1" />
                <span className="text-xs font-semibold text-white">{property.bedrooms}</span>
                <span className="text-[10px] text-gray-500">bed</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex flex-col items-center p-2.5 bg-gray-800/40 border border-gray-700/30 rounded-lg">
                <Bath className="size-4 text-gray-400 mb-1" />
                <span className="text-xs font-semibold text-white">{property.bathrooms}</span>
                <span className="text-[10px] text-gray-500">bath</span>
              </div>
            )}
            {property.square_feet && (
              <div className="flex flex-col items-center p-2.5 bg-gray-800/40 border border-gray-700/30 rounded-lg">
                <Square className="size-4 text-gray-400 mb-1" />
                <span className="text-xs font-semibold text-white">{property.square_feet}</span>
                <span className="text-[10px] text-gray-500">sqft</span>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        {property.price && (
          <div className="mb-5 p-3 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-xl">
            <p className="text-2xl font-bold text-white flex items-center gap-1">
              <DollarSign className="size-6 text-gray-400" />
              {property.price}
            </p>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={() => onViewDetails(property.id)}
          className="w-full py-3 bg-gray-800/60 border-2 border-gray-700/50 text-gray-300 rounded-xl font-semibold transition-all duration-300"
        >
          View Details
        </button>
      </div>
    </div>
  )
}