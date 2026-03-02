'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseApiOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (promise: Promise<T>) => Promise<T>;
}

/**
 * Hook for making API calls with loading and error handling
 */
export function useApi<T>(options: UseApiOptions = {}): UseApiReturn<T> {
  const {
    showSuccessToast = false,
    successMessage = 'Operation successful',
    showErrorToast = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (promise: Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const result = await promise;
        setData(result);

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (showErrorToast) {
          toast.error(error.message || 'An error occurred');
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [showSuccessToast, successMessage, showErrorToast]
  );

  return { data, loading, error, execute };
}

/**
 * Hook for fetching data with pagination
 */
interface UsePaginatedApiOptions<T> extends UseApiOptions {
  onDataReceived?: (data: T[]) => void;
}

interface UsePaginatedApiReturn<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  nextCursor: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePaginatedApi<T>(
  fetcher: (cursor?: string) => Promise<{ items: T[]; nextCursor: string | null; hasMore: boolean }>,
  options: UsePaginatedApiOptions<T> = {}
): UsePaginatedApiReturn<T> {
  const { onDataReceived } = options;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setItems(result.items);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);

      if (onDataReceived) {
        onDataReceived(result.items);
      }

      toast.success('Data refreshed');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetcher, onDataReceived]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher(nextCursor);
      setItems((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);

      if (onDataReceived) {
        onDataReceived(result.items);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error(error.message || 'Failed to load more data');
    } finally {
      setLoading(false);
    }
  }, [fetcher, nextCursor, hasMore, loading, onDataReceived]);

  return {
    items,
    loading,
    error,
    hasMore,
    nextCursor,
    loadMore,
    refresh,
  };
}
