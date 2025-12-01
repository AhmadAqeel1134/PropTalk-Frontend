// hooks/useAgent.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api'

export const useAgentDashboard = () => useQuery({
  queryKey: ['agent-dashboard'],
  queryFn: api.getAgentDashboard,
})

export const useMyContacts = (search?: string) => useQuery({
  queryKey: ['my-contacts', search],
  queryFn: () => api.getMyContacts(search),
})

export const useContact = (id: string) => useQuery({
  queryKey: ['contact', id],
  queryFn: () => api.getContactById(id),
  enabled: !!id,
})

export const useMyProperties = (filters?: any) => useQuery({
  queryKey: ['my-properties', filters],
  queryFn: () => api.getMyProperties(filters),
})

export const useMyDocuments = () => useQuery({
  queryKey: ['my-documents'],
  queryFn: api.getMyDocuments,
})