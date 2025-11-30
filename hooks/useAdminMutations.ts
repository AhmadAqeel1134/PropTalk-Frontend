'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AgentWithStats } from '@/types/admin.types';

/**
 * Hook to invalidate admin queries after mutations
 * This ensures instant updates after admin actions
 */
export function useAdminQueryInvalidation() {
  const queryClient = useQueryClient();

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };

  const invalidateAgents = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'agents'] });
  };

  const invalidateAgentDetails = (agentId?: string) => {
    if (agentId) {
      queryClient.invalidateQueries({ queryKey: ['admin', 'agents', agentId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin', 'agents'] });
    }
  };

  const invalidateAll = () => {
    invalidateDashboard();
    invalidateAgents();
  };

  return {
    invalidateDashboard,
    invalidateAgents,
    invalidateAgentDetails,
    invalidateAll,
  };
}

/**
 * Example mutation hook for creating/updating agents
 * This will automatically invalidate queries for instant updates
 * 
 * Usage:
 * const { mutate: createAgent } = useCreateAgent();
 * createAgent(newAgentData);
 */
export function useCreateAgent() {
  const queryClient = useQueryClient();
  const { invalidateAll } = useAdminQueryInvalidation();

  return useMutation({
    mutationFn: async (agentData: any) => {
      // TODO: Replace with actual API call when create agent endpoint is ready
      // const response = await fetch('/admin/real-estate-agents', {
      //   method: 'POST',
      //   body: JSON.stringify(agentData),
      // });
      // return response.json();
      throw new Error('Create agent endpoint not implemented yet');
    },
    onSuccess: () => {
      // Invalidate queries for instant updates
      invalidateAll();
    },
    onError: (error) => {
      console.error('Error creating agent:', error);
    },
  });
}

/**
 * Example mutation hook for updating agents
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient();
  const { invalidateAll } = useAdminQueryInvalidation();

  return useMutation({
    mutationFn: async ({ agentId, data }: { agentId: string; data: any }) => {
      // TODO: Replace with actual API call when update agent endpoint is ready
      throw new Error('Update agent endpoint not implemented yet');
    },
    onSuccess: (_, variables) => {
      // Invalidate queries for instant updates
      invalidateAll();
      // Also invalidate specific agent details
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'agents', variables.agentId, 'details'] 
      });
    },
  });
}

/**
 * Optimistic update helper for dashboard
 * Updates UI immediately, then syncs with server
 */
export function useOptimisticDashboardUpdate() {
  const queryClient = useQueryClient();

  const incrementAgentCount = () => {
    queryClient.setQueryData<AgentWithStats[]>(['admin', 'agents'], (old) => {
      if (!old) return old;
      return old; // Will be updated by invalidation
    });

    queryClient.setQueryData(['admin', 'dashboard'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        real_estate_agents: {
          ...old.real_estate_agents,
          total_agents: old.real_estate_agents.total_agents + 1,
          active_agents: old.real_estate_agents.active_agents + 1,
        },
      };
    });
  };

  return { incrementAgentCount };
}

