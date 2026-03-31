import { useState, useEffect, useCallback, useRef } from "react";
import { ApiClientError } from "./api/client";

/**
 * Generic data fetching hook with loading, error, and refresh.
 */
export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => {
      mountedRef.current = false;
    };
  }, [fetch]);

  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch, setData };
}

/**
 * Mutation hook for create/update/delete operations.
 */
export function useApiMutation<TArgs extends any[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  options?: {
    onSuccess?: (data: TResult) => void;
    onError?: (error: string) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(...args);
        setLoading(false);
        options?.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const message = err instanceof ApiClientError
          ? err.message
          : err.message || "Something went wrong";
        setError(message);
        setLoading(false);
        options?.onError?.(message);
        return undefined;
      }
    },
    [mutationFn]
  );

  return { mutate, loading, error };
}

/**
 * Debounced value hook for search inputs.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
