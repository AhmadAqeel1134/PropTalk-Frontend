'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to check if the document/tab is visible
 * Used for smart refetching - only refetch when user is actively viewing
 */
export function useVisibilityRefetch() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check initial visibility
    setIsVisible(document.visibilityState === 'visible');

    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

/**
 * Get refetch interval based on visibility
 * Returns interval in milliseconds if visible, false if hidden
 */
export function getSmartRefetchInterval(intervalMs: number = 60000) {
  return (query: any) => {
    // Only refetch if tab is visible
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      // Only refetch if data is stale
      if (query.state.isStale) {
        return intervalMs;
      }
    }
    return false; // Don't refetch when tab is hidden or data is fresh
  };
}

