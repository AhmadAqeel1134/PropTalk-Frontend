'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminDashboard,
  getAllAgents,
  getAgentFullDetails,
  getAgentProperties,
  getAgentPropertiesPaginated,
  getAgentDocuments,
  getAgentDocumentsPaginated,
  getAgentContacts,
  getAgentPhoneNumber,
  getAdminRagAgents,
  getAdminRagOverview,
  getAdminRagTimeseries,
  getAdminRagQueries,
  getAdminRagTopSources,
  getAdminRagFailures,
  getAdminRagEmbeddingOverview,
  getAdminRagEmbeddingJobs,
} from '@/lib/api';
import type {
  DashboardStats,
  AgentWithStats,
  AgentFullDetails,
  Property,
  PaginatedProperties,
  Document,
  PaginatedDocuments,
  Contact,
  PhoneNumber,
} from '@/types/admin.types';
import { getSmartRefetchInterval } from './useVisibilityRefetch';

// Smart refetch interval: 60 seconds when tab is visible
const SMART_REFETCH_INTERVAL = getSmartRefetchInterval(60000);

// Admin Dashboard Hook - with smart refetching (always fetch latest data)
export function useAdminDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    staleTime: 0, // Always consider data stale - ensures latest data on every mount/focus
    gcTime: 30000, // Keep in cache for 30 seconds
    refetchOnWindowFocus: true, // Refetch when switching back to tab
    refetchOnMount: 'always', // Always refetch when component mounts (shows latest data)
    refetchInterval: SMART_REFETCH_INTERVAL, // Smart refetch: 60s when visible
    refetchIntervalInBackground: false, // Never refetch when tab is hidden
  });
}

// All Agents Hook - with smart refetching and server-side filtering
export function useAgents(search?: string, isVerified?: boolean, isActive?: boolean) {
  return useQuery<AgentWithStats[]>({
    queryKey: ['admin', 'agents', search || '', isVerified, isActive],
    queryFn: () => getAllAgents(search, isVerified, isActive),
    staleTime: 0, // Always consider data stale - ensures fresh data on filter changes
    gcTime: 30000, // 30 seconds - keep in cache for shorter time
    refetchOnWindowFocus: true, // Refetch when switching back to tab
    refetchOnMount: 'always', // Always refetch when component mounts (shows fresh data)
    refetchInterval: SMART_REFETCH_INTERVAL, // Smart refetch: 60s when visible
    refetchIntervalInBackground: false, // Never refetch when tab is hidden
    // Don't use placeholderData - we want to show loading state when filters change, not stale data
  });
}

// Agent Details Hook
export function useAgentDetails(agentId: string) {
  return useQuery<AgentFullDetails>({
    queryKey: ['admin', 'agents', agentId, 'details'],
    queryFn: () => getAgentFullDetails(agentId),
    enabled: !!agentId,
    staleTime: 30000,
  });
}

// Agent Properties Hook
export function useAgentProperties(agentId: string) {
  return useQuery<Property[]>({
    queryKey: ['admin', 'agents', agentId, 'properties'],
    queryFn: () => getAgentProperties(agentId),
    enabled: !!agentId,
    staleTime: 30000,
  });
}

// Agent Properties Paginated Hook
export function useAgentPropertiesPaginated(agentId: string, page: number = 1, pageSize: number = 16) {
  return useQuery<PaginatedProperties>({
    queryKey: ['admin', 'agents', agentId, 'properties', 'paginated', page, pageSize],
    queryFn: () => getAgentPropertiesPaginated(agentId, page, pageSize),
    enabled: !!agentId,
    staleTime: 30000,
  });
}

// Agent Documents Hook
export function useAgentDocuments(agentId: string) {
  return useQuery<Document[]>({
    queryKey: ['admin', 'agents', agentId, 'documents'],
    queryFn: () => getAgentDocuments(agentId),
    enabled: !!agentId,
    staleTime: 30000,
  });
}

// Agent Documents Paginated Hook
export function useAgentDocumentsPaginated(agentId: string, page: number = 1, pageSize: number = 16) {
  return useQuery<PaginatedDocuments>({
    queryKey: ['admin', 'agents', agentId, 'documents', 'paginated', page, pageSize],
    queryFn: () => getAgentDocumentsPaginated(agentId, page, pageSize),
    enabled: !!agentId,
    staleTime: 30000,
  });
}

// Agent Contacts Hook
export function useAgentContacts(agentId: string) {
  return useQuery<Contact[]>({
    queryKey: ['admin', 'agents', agentId, 'contacts'],
    queryFn: () => getAgentContacts(agentId),
    enabled: !!agentId,
    staleTime: 30000,
  });
}

// Agent Phone Number Hook
export function useAgentPhoneNumber(agentId: string) {
  return useQuery<PhoneNumber>({
    queryKey: ['admin', 'agents', agentId, 'phone'],
    queryFn: () => getAgentPhoneNumber(agentId),
    enabled: !!agentId,
    staleTime: 30000,
  });
}

export function useAdminRagAgents() {
  return useQuery({
    queryKey: ['admin', 'rag', 'agents'],
    queryFn: getAdminRagAgents,
    staleTime: 30000,
  })
}

export function useAdminRagOverview(agentId: string, window: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['admin', 'rag', 'overview', agentId, window],
    queryFn: () => getAdminRagOverview(agentId, window),
    enabled: !!agentId,
    staleTime: 30000,
  })
}

export function useAdminRagTimeseries(
  agentId: string,
  window: '7d' | '30d' | '90d' = '30d',
  bucket: 'day' | 'week' = 'day'
) {
  return useQuery({
    queryKey: ['admin', 'rag', 'timeseries', agentId, window, bucket],
    queryFn: () => getAdminRagTimeseries(agentId, window, bucket),
    enabled: !!agentId,
    staleTime: 30000,
  })
}

export function useAdminRagQueries(
  agentId: string,
  params?: { window?: '7d' | '30d' | '90d'; page?: number; page_size?: number }
) {
  return useQuery({
    queryKey: ['admin', 'rag', 'queries', agentId, params?.window || '30d', params?.page || 1, params?.page_size || 20],
    queryFn: () => getAdminRagQueries(agentId, params),
    enabled: !!agentId,
    staleTime: 15000,
  })
}

export function useAdminRagTopSources(
  agentId: string,
  window: '7d' | '30d' | '90d' = '30d',
  limit = 10
) {
  return useQuery({
    queryKey: ['admin', 'rag', 'sources', agentId, window, limit],
    queryFn: () => getAdminRagTopSources(agentId, window, limit),
    enabled: !!agentId,
    staleTime: 30000,
  })
}

export function useAdminRagFailures(
  agentId: string,
  window: '7d' | '30d' | '90d' = '30d',
  limit = 20
) {
  return useQuery({
    queryKey: ['admin', 'rag', 'failures', agentId, window, limit],
    queryFn: () => getAdminRagFailures(agentId, window, limit),
    enabled: !!agentId,
    staleTime: 30000,
  })
}

export function useAdminRagEmbeddingOverview(agentId: string) {
  return useQuery({
    queryKey: ['admin', 'rag', 'embedding', 'overview', agentId],
    queryFn: () => getAdminRagEmbeddingOverview(agentId),
    enabled: !!agentId,
    staleTime: 30000,
  })
}

export function useAdminRagEmbeddingJobs(agentId: string, limit = 20) {
  return useQuery({
    queryKey: ['admin', 'rag', 'embedding', 'jobs', agentId, limit],
    queryFn: () => getAdminRagEmbeddingJobs(agentId, limit),
    enabled: !!agentId,
    staleTime: 15000,
  })
}

