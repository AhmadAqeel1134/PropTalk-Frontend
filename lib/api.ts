const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token') || localStorage.getItem('access_token')
}

// Helper function for authenticated requests
async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken()
  
  if (!token) {
    // Redirect to login if no token
    if (typeof window !== 'undefined') {
      window.location.href = '/login/admin'
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
    
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      // Clear invalid tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('access_token')
        // Redirect to login
        window.location.href = '/login/admin'
      }
      throw new Error('Session expired. Please login again.')
    }
    
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Auth functions
export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  return response.json()
}

export async function agentLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/real-estate-agent/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  return response.json()
}

// Admin API functions
export async function getAdminDashboard() {
  return authenticatedFetch('/admin/dashboard')
}

export async function getAllAgents(search?: string, isVerified?: boolean, isActive?: boolean) {
  const params = new URLSearchParams();
  // Ensure search is a string, not an object
  if (search && typeof search === 'string' && search.trim() !== '') {
    params.append('search', search.trim());
  }
  if (isVerified !== undefined && typeof isVerified === 'boolean') {
    params.append('is_verified', String(isVerified));
  }
  if (isActive !== undefined && typeof isActive === 'boolean') {
    params.append('is_active', String(isActive));
  }
  
  const queryString = params.toString();
  const endpoint = queryString ? `/admin/real-estate-agents?${queryString}` : '/admin/real-estate-agents';
  
  return authenticatedFetch(endpoint);
}

export async function verifyAgent(agentId: string) {
  return authenticatedFetch(`/admin/real-estate-agents/${agentId}/verify`, {
    method: 'POST',
  });
}

export async function unverifyAgent(agentId: string) {
  return authenticatedFetch(`/admin/real-estate-agents/${agentId}/unverify`, {
    method: 'POST',
  });
}

export async function getAgentFullDetails(agentId: string) {
  return authenticatedFetch(`/admin/real-estate-agents/${agentId}/full-details`)
}

export async function getAgentProperties(agentId: string) {
  return authenticatedFetch(`/admin/real-estate-agents/${agentId}/properties`)
}

export async function getAgentPropertiesPaginated(agentId: string, page: number = 1, pageSize: number = 16) {
  return authenticatedFetch(`/admin/real-estate-agents/${agentId}/properties/paginated?page=${page}&page_size=${pageSize}`)
}

export async function getAgentDocuments(agentId: string) {
  return authenticatedFetch(`/admin/real-estate-agents/${agentId}/documents`)
}

export async function getAgentDocumentsPaginated(agentId: string, page: number = 1, pageSize: number = 16) {
  return authenticatedFetch(`/admin/real-estate-agents/${agentId}/documents/paginated?page=${page}&page_size=${pageSize}`)
}

export async function getAgentContacts(agentId: string) {
  return authenticatedFetch(`/admin/real-estate-agents/${agentId}/contacts`)
}

export async function getAgentPhoneNumber(agentId: string) {
  return authenticatedFetch(`/admin/real-estate-agents/${agentId}/phone-number`)
}

