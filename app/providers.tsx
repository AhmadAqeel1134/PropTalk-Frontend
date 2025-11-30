'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Refetch when switching back to tab
      refetchOnMount: 'always', // Always refetch when component mounts (shows fresh data)
      retry: 1,
      staleTime: 5000, // 5 seconds - data considered stale quickly for real-time feel
      gcTime: 60000, // 60 seconds - keep in cache for 1 minute
      refetchIntervalInBackground: false, // Never refetch when tab is hidden
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

