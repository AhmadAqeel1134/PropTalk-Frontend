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

export interface PaginatedProperties {
  items: Property[]
  total: number
  page: number
  page_size: number
}

export interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: string | null
  cloudinary_url: string
  description: string | null
  properties_count: number
  contacts_count: number
  created_at: string
  updated_at?: string
}

export interface CallStatistics {
  period: 'day' | 'week' | 'month'
  total_calls: number
  completed_calls: number
  failed_calls: number
  total_duration_seconds: number
  average_duration_seconds: number
  calls_by_status: Record<string, number>
  calls_by_day: { date: string; count: number }[]
}

export interface Showing {
  id: string
  real_estate_agent_id: string
  voice_agent_id: string | null
  contact_id: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  property_id: string | null
  property_address: string | null
  property_city: string | null
  property_state: string | null
  property_type: string | null
  property_price: number | null
  property_bedrooms: number | null
  property_bathrooms: number | null
  property_sqft: number | null
  call_id: string | null
  caller_phone: string | null
  caller_name: string | null
  visit_type: string
  scheduled_start: string
  scheduled_end: string | null
  status: string
  source: string
  twilio_call_sid: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedShowings {
  items: Showing[]
  total: number
  page: number
  page_size: number
}

export interface VoiceAgentSettings {
  voice_gender?: 'female' | 'male'
  voice_speed?: 'normal' | 'slow' | 'fast'
  language?: string
  greeting_message?: string
  custom_commands?: string[]
  recording_enabled?: boolean
  elevenlabs_voice_id?: string
  elevenlabs_speed?: number
  elevenlabs_stability?: number
  elevenlabs_similarity_boost?: number
}