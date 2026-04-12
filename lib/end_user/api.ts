const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getUserToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('user_token')
}

async function userFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getUserToken()
  if (!token) {
    if (typeof window !== 'undefined') window.location.href = '/login/user'
    throw new Error('Not authenticated')
  }
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('user_token')
    if (typeof window !== 'undefined') window.location.href = '/login/user'
    throw new Error('Session expired')
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Request failed' }))
    const d = err.detail
    const msg =
      typeof d === 'string'
        ? d
        : Array.isArray(d)
          ? d.map((x: { msg?: string }) => x?.msg || JSON.stringify(x)).join('; ')
          : JSON.stringify(d)
    throw new Error(msg || `HTTP ${response.status}`)
  }
  if (response.status === 204) return {} as T
  const text = await response.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export async function endUserRegister(body: {
  email: string
  password: string
  full_name: string
  phone_number?: string
}) {
  const response = await fetch(`${API_URL}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Registration failed' }))
    throw new Error(err.detail || 'Registration failed')
  }
  return response.json()
}

export async function endUserLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Login failed' }))
    throw new Error(err.detail || 'Login failed')
  }
  return response.json() as Promise<{ access_token: string; token_type: string }>
}

export async function getEndUserMe() {
  return userFetch<{
    id: string
    email: string
    full_name: string
    phone_number: string | null
    phone_saved_at: string | null
    is_active: boolean
    created_at: string
  }>('/user/me')
}

export async function updateEndUserPhone(phone_number: string) {
  return userFetch<{
    id: string
    email: string
    full_name: string
    phone_number: string | null
    phone_saved_at: string | null
    is_active: boolean
    created_at: string
  }>('/user/me/phone', {
    method: 'PATCH',
    body: JSON.stringify({ phone_number }),
  })
}

export async function listDirectoryAgents() {
  return userFetch<
    Array<{
      id: string
      full_name: string
      company_name: string | null
      is_verified: boolean
    }>
  >('/user/agents')
}

export async function getDirectoryAgent(agentId: string) {
  return userFetch<{
    id: string
    full_name: string
    company_name: string | null
    is_verified: boolean
    voice_agent_name: string | null
    voice_agent_status: string | null
  }>(`/user/agents/${agentId}`)
}

export async function listUserCallsForAgent(agentId: string, page = 1, pageSize = 20) {
  return userFetch<{
    items: unknown[]
    total: number
    page: number
    page_size: number
  }>(`/user/agents/${agentId}/calls?page=${page}&page_size=${pageSize}`)
}

export async function listUserShowingsForAgent(agentId: string, page = 1, pageSize = 20) {
  return userFetch<{
    items: unknown[]
    total: number
    page: number
    page_size: number
  }>(`/user/agents/${agentId}/showings?page=${page}&page_size=${pageSize}`)
}

export async function userChat(agentId: string, message: string) {
  return userFetch<{ answer: string; sources: string[]; rag_enabled: boolean }>(
    `/user/agents/${agentId}/chat`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    }
  )
}

/** Fetch recording as blob (authenticated); path is e.g. /user/agents/.../recording/stream */
export async function fetchUserRecordingBlob(streamPath: string): Promise<Blob> {
  const token = getUserToken()
  if (!token) throw new Error('Not authenticated')
  const response = await fetch(`${API_URL}${streamPath}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error('Could not load recording')
  }
  return response.blob()
}
