const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Helper function to get agent auth token
function getAgentToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('agent_token') || localStorage.getItem('access_token')
}

// Helper function for authenticated agent requests
async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAgentToken()
  
  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login/agent'
    }
    throw new Error('No authentication token found. Please login.')
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('agent_token')
        localStorage.removeItem('access_token')
        window.location.href = '/login/agent'
      }
      throw new Error('Session expired. Please login again.')
    }
    
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  // Handle 204/empty responses (e.g. DELETE) gracefully
  if (response.status === 204 || response.status === 205) {
    return {}
  }

  // Some backends may return no body with 200; guard against that
  const text = await response.text()
  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    // Fallback to raw text if it's not JSON
    return text as any
  }
}

// Agent Dashboard
export const getAgentDashboard = async () => {
  return authenticatedFetch('/agent/dashboard')
}

// Contacts
export const getMyContacts = async (search?: string, hasProperties?: boolean) => {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (hasProperties !== undefined) params.append('has_properties', String(hasProperties))
  const queryString = params.toString()
  const endpoint = queryString ? `/contacts/my-contacts?${queryString}` : '/contacts/my-contacts'
  return authenticatedFetch(endpoint)
}

export const getContactById = async (id: string) => {
  return authenticatedFetch(`/contacts/${id}`)
}

export const createContact = async (data: any) => {
  return authenticatedFetch('/contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const updateContact = async (id: string, data: any) => {
  return authenticatedFetch(`/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export const deleteContact = async (id: string) => {
  return authenticatedFetch(`/contacts/${id}`, {
    method: 'DELETE',
  })
}

export const getContactProperties = async (contactId: string) => {
  return authenticatedFetch(`/contacts/${contactId}/properties`)
}

// Properties
export const getMyProperties = async (filters?: {
  search?: string
  property_type?: string
  city?: string
  is_available?: boolean
  contact_id?: string
  page?: number
  page_size?: number
}) => {
  const params = new URLSearchParams()
  if (filters?.search) params.append('search', filters.search)
  if (filters?.property_type) params.append('property_type', filters.property_type)
  if (filters?.city) params.append('city', filters.city)
  if (filters?.is_available !== undefined) params.append('is_available', String(filters.is_available))
  if (filters?.contact_id) params.append('contact_id', filters.contact_id)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const queryString = params.toString()
  const endpoint = queryString ? `/properties/my-properties?${queryString}` : '/properties/my-properties'
  return authenticatedFetch(endpoint)
}

export const getPropertyById = async (id: string) => {
  return authenticatedFetch(`/properties/${id}`)
}

export const createProperty = async (data: any) => {
  return authenticatedFetch('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const updateProperty = async (id: string, data: any) => {
  return authenticatedFetch(`/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export const deleteProperty = async (id: string) => {
  return authenticatedFetch(`/properties/${id}`, {
    method: 'DELETE',
  })
}

// Documents
export const getMyDocuments = async () => {
  return authenticatedFetch('/documents/my-documents')
}

export const getDocumentById = async (id: string) => {
  return authenticatedFetch(`/documents/${id}`)
}

export const uploadDocument = async (file: File, description?: string) => {
  const formData = new FormData()
  formData.append('file', file)
  if (description) formData.append('description', description)
  
  const token = getAgentToken()
  if (!token) throw new Error('No authentication token found')
  
  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
    throw new Error(error.detail || 'Upload failed')
  }

  return response.json()
}

export const deleteDocument = async (id: string) => {
  return authenticatedFetch(`/documents/${id}`, {
    method: 'DELETE',
  })
}

export const getDocumentProperties = async (documentId: string) => {
  return authenticatedFetch(`/documents/${documentId}/properties`)
}

export const getDocumentContacts = async (documentId: string) => {
  return authenticatedFetch(`/documents/${documentId}/contacts`)
}

// Profile
export const getAgentProfile = async () => {
  return authenticatedFetch('/agent/profile')
}

export const updateAgentProfile = async (data: any) => {
  return authenticatedFetch('/agent/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export const changePassword = async (data: { old_password: string; new_password: string }) => {
  return authenticatedFetch('/agent/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Voice Agent API functions
export const requestVoiceAgent = async () => {
  return authenticatedFetch('/agent/voice-agent/request', {
    method: 'POST',
  })
}

export const getVoiceAgent = async () => {
  return authenticatedFetch('/agent/voice-agent')
}

export const getVoiceAgentStatus = async () => {
  return authenticatedFetch('/agent/voice-agent/status')
}

export const updateVoiceAgent = async (data: {
  name?: string
  use_default_prompt?: boolean
  system_prompt?: string
  settings?: {
    voice_gender?: 'female' | 'male'
    voice_speed?: 'normal' | 'slow' | 'fast'
    language?: string
    greeting_message?: string
    custom_commands?: string[]
    recording_enabled?: boolean
  }
}) => {
  return authenticatedFetch('/agent/voice-agent', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export const toggleVoiceAgentStatus = async (status: 'active' | 'inactive') => {
  return authenticatedFetch('/agent/voice-agent/toggle-status', {
    method: 'POST',
    body: JSON.stringify({ status }),
  })
}

// Call API functions
export const initiateCall = async (data: { contact_id?: string; phone_number: string }) => {
  return authenticatedFetch('/agent/calls/initiate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const initiateBatchCalls = async (data: { contact_ids: string[]; delay_seconds: number }) => {
  return authenticatedFetch('/agent/calls/batch', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const getCalls = async (params?: {
  page?: number
  page_size?: number
  status?: string
  direction?: string
  search?: string
}) => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
  if (params?.status) queryParams.append('status', params.status)
  if (params?.direction) queryParams.append('direction', params.direction)
  if (params?.search) queryParams.append('search', params.search)
  
  const queryString = queryParams.toString()
  const endpoint = queryString ? `/agent/calls?${queryString}` : '/agent/calls'
  return authenticatedFetch(endpoint)
}

export const getCallById = async (callId: string) => {
  return authenticatedFetch(`/agent/calls/${callId}`)
}

export const getCallRecording = async (callId: string) => {
  return authenticatedFetch(`/agent/calls/${callId}/recording`)
}

export const getCallTranscript = async (callId: string) => {
  return authenticatedFetch(`/agent/calls/${callId}/transcript`)
}

