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

