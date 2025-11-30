// components/agent/PropertyCard.tsx
import { Bed, Bath, Square, MapPin, DollarSign } from 'lucide-react'

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
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 transition-all duration-300">
      <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-800" />
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white line-clamp-1">{property.address}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${property.is_available === 'true' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
            {property.is_available === 'true' ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <MapPin className="size-4" />
          <span>{property.city || 'N/A'}</span>
        </div>

        {property.property_type && (
          <span className="inline-block px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full mb-4">
            {property.property_type}
          </span>
        )}

        <div className="grid grid-cols-3 gap-3 mb-5 text-sm">
          {property.bedrooms && (
            <div className="flex items-center gap-2">
              <Bed className="size-4 text-gray-500" />
              <span className="text-gray-300">{property.bedrooms} bed</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-2">
              <Bath className="size-4 text-gray-500" />
              <span className="text-gray-300">{property.bathrooms} bath</span>
            </div>
          )}
          {property.square_feet && (
            <div className="flex items-center gap-2">
              <Square className="size-4 text-gray-500" />
              <span className="text-gray-300">{property.square_feet} sqft</span>
            </div>
          )}
        </div>

        {property.price && (
          <p className="text-2xl font-bold text-white mb-5 flex items-center gap-1">
            <DollarSign className="size-6" />
            {property.price}
          </p>
        )}

        <button
          onClick={() => onViewDetails(property.id)}
          className="w-full py-3 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg font-medium transition-all"
        >
          View Details
        </button>
      </div>
    </div>
  )
}