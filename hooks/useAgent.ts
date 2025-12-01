'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAgentDashboard,
  getMyContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactProperties,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  getDocumentProperties,
  getDocumentContacts,
  getAgentProfile,
  updateAgentProfile,
  changePassword,
} from '@/lib/real_estate_agent/api'
import type { AgentDashboardData, Contact, Property, Document, PaginatedProperties } from '@/types/agent.types'
import { getSmartRefetchInterval } from './useVisibilityRefetch'

const SMART_REFETCH_INTERVAL = getSmartRefetchInterval(60000)

// Dashboard
export function useAgentDashboard() {
  return useQuery<AgentDashboardData>({
    queryKey: ['agent', 'dashboard'],
    queryFn: getAgentDashboard,
    staleTime: 0,
    gcTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    refetchInterval: SMART_REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  })
}

// Contacts
export function useMyContacts(search?: string, hasProperties?: boolean) {
  return useQuery<Contact[]>({
    queryKey: ['agent', 'contacts', search || '', hasProperties],
    queryFn: () => getMyContacts(search, hasProperties),
    staleTime: 0,
    gcTime: 30000,
    refetchOnMount: 'always',
  })
}

export function useContact(contactId: string) {
  return useQuery<Contact>({
    queryKey: ['agent', 'contacts', contactId],
    queryFn: () => getContactById(contactId),
    enabled: !!contactId,
  })
}

export function useContactProperties(contactId: string) {
  return useQuery<Property[]>({
    queryKey: ['agent', 'contacts', contactId, 'properties'],
    queryFn: () => getContactProperties(contactId),
    enabled: !!contactId,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'contacts'] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'dashboard'] })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateContact(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'contacts'] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'contacts', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'dashboard'] })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteContact,
    // Optimistic update for snappy UI
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['agent', 'contacts'] })

      const previous = queryClient.getQueryData<Contact[]>(['agent', 'contacts', '', undefined])

      // Optimistically remove from any cached contacts lists
      queryClient.setQueriesData<Contact[]>(
        { queryKey: ['agent', 'contacts'] },
        (old) => old?.filter((c) => c.id !== id) || []
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      // Rollback if something goes wrong
      if (context?.previous) {
        queryClient.setQueriesData(['agent','contacts', '', undefined], context.previous)
      }
    },
    onSettled: () => {
      // Always refetch to ensure server truth
      queryClient.invalidateQueries({ queryKey: ['agent', 'contacts'] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'dashboard'] })
    },
  })
}

// Properties
export function useMyProperties(filters?: {
  search?: string
  property_type?: string
  city?: string
  is_available?: boolean
  contact_id?: string
}) {
  return useQuery<PaginatedProperties>({
    queryKey: ['agent', 'properties', filters],
    queryFn: () => getMyProperties(filters),
    staleTime: 0,
    gcTime: 30000,
    refetchOnMount: 'always',
  })
}

export function useProperty(propertyId: string) {
  return useQuery<Property>({
    queryKey: ['agent', 'properties', propertyId],
    queryFn: () => getPropertyById(propertyId),
    enabled: !!propertyId,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'properties'] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'dashboard'] })
    },
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProperty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'properties'] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'properties', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'dashboard'] })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'properties'] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'dashboard'] })
    },
  })
}

// Documents
export function useMyDocuments() {
  return useQuery<Document[]>({
    queryKey: ['agent', 'documents'],
    queryFn: getMyDocuments,
    staleTime: 0,
    gcTime: 30000,
    refetchOnMount: 'always',
  })
}

export function useDocument(documentId: string) {
  return useQuery<Document & { properties_count?: number; contacts_count?: number }>({
    queryKey: ['agent', 'documents', documentId],
    queryFn: () => getDocumentById(documentId),
    enabled: !!documentId,
  })
}

export function useDocumentProperties(documentId: string) {
  return useQuery<Property[]>({
    queryKey: ['agent', 'documents', documentId, 'properties'],
    queryFn: () => getDocumentProperties(documentId),
    enabled: !!documentId,
  })
}

export function useDocumentContacts(documentId: string) {
  return useQuery<Contact[]>({
    queryKey: ['agent', 'documents', documentId, 'contacts'],
    queryFn: () => getDocumentContacts(documentId),
    enabled: !!documentId,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, description }: { file: File; description?: string }) =>
      uploadDocument(file, description),
    onSuccess: () => {
      // Invalidate all related queries to refresh data after upload
      queryClient.invalidateQueries({ queryKey: ['agent', 'documents'] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'properties'] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'contacts'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'documents'] })
      queryClient.invalidateQueries({ queryKey: ['agent', 'dashboard'] })
    },
  })
}

// Profile
export function useAgentProfile() {
  return useQuery({
    queryKey: ['agent', 'profile'],
    queryFn: getAgentProfile,
  })
}

export function useUpdateAgentProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAgentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'profile'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  })
}

