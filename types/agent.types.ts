// types/agent.types.ts
export interface AgentDashboardData {
  total_properties: number
  available_properties: number
  unavailable_properties: number
  properties_by_type: Record<string, number>
  total_documents: number
  total_contacts: number
  contacts_with_properties: number
  has_phone_number: boolean
  phone_number: string | null
  is_verified: boolean
  recent_properties: Array<{
    id: string
    address: string
    city: string | null
    property_type: string | null
    price: string | null
    is_available: string
    created_at: string
  }>
  recent_contacts: Array<{
    id: string
    name: string
    phone_number: string
    email: string | null
    created_at: string
  }>
}

export interface Contact {
  id: string
  name: string
  phone_number: string
  email: string | null
  notes: string | null
  properties_count: number
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  address: string
  city: string | null
  state: string | null
  property_type: string | null
  price: string | null
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  is_available: string
  contact_id: string | null
  owner_name: string | null
  owner_phone: string
}

export interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: string | null
  cloudinary_url: string
  description: string | null
  created_at: string
}