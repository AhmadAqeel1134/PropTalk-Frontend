export interface RealEstateAgent {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentStats {
  properties_count: number;
  documents_count: number;
  contacts_count: number;
  has_phone_number: boolean;
}

export interface AgentWithStats extends RealEstateAgent {
  stats: AgentStats;
}

export interface Property {
  id: string;
  real_estate_agent_id: string;
  document_id: string | null;
  property_type: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  price: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  description: string | null;
  amenities: string | null;
  owner_name: string | null;
  owner_phone: string;
  is_available: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  real_estate_agent_id: string;
  file_name: string;
  file_type: string;
  file_size: string | null;
  cloudinary_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumber {
  id: string;
  real_estate_agent_id: string;
  twilio_phone_number: string;
  twilio_sid: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  // Empty for now - will be populated later
  [key: string]: any;
}

export interface AgentFullDetails {
  agent: RealEstateAgent;
  properties: Property[];
  documents: Document[];
  phone_number: PhoneNumber | null;
  contacts: Contact[];
}

export interface DashboardStats {
  real_estate_agents: {
    total_agents: number;
    active_agents: number;
    inactive_agents: number;
    verified_agents: number;
    unverified_agents: number;
  };
  overall_stats: {
    total_properties: number;
    total_documents: number;
    total_phone_numbers: number;
    total_contacts: number;
  };
}

export interface PaginatedDocuments {
  items: Document[];
  total: number;
  page: number;
  page_size: number;
}

export interface PaginatedProperties {
  items: Property[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  message: string;
  status?: number;
  detail?: string;
}

