import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError, ValidationError, NetworkError } from '../lib/api';

// Generic API hook for data fetching
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { immediate = true, onSuccess, onError } = options;

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      // Log different error types
      if (error instanceof ValidationError) {
        console.warn('[Validation Error]:', error.message, error.details);
      } else if (error instanceof NetworkError) {
        console.error('[Network Error]:', error.message);
      } else if (error instanceof ApiError) {
        console.error('[API Error]:', error.code, error.message);
      } else {
        console.error('[Unknown Error]:', error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    retry,
    isValidationError: error instanceof ValidationError,
    isNetworkError: error instanceof NetworkError,
    isApiError: error instanceof ApiError,
  };
}

// Specialized hooks for different data types
export function useProducts(filters?: any) {
  return useApi(
    () => apiClient.getProducts(filters),
    [JSON.stringify(filters)],
    {
      onError: (error) => {
        console.error('Failed to fetch products:', error);
      },
    }
  );
}

export function useBrand() {
  return useApi(
    () => apiClient.getBrand(),
    [],
    {
      onError: (error) => {
        console.error('Failed to fetch brand:', error);
      },
    }
  );
}

export function useStyleTags() {
  return useApi(
    () => apiClient.getStyleTags(),
    [],
    {
      onError: (error) => {
        console.error('Failed to fetch style tags:', error);
      },
    }
  );
}

export function useAnalytics(filters?: any) {
  return useApi(
    () => apiClient.getAnalytics(filters),
    [JSON.stringify(filters)],
    {
      onError: (error) => {
        console.error('Failed to fetch analytics:', error);
      },
    }
  );
}

export function useIntegrations() {
  return useApi(
    () => apiClient.getIntegrations(),
    [],
    {
      onError: (error) => {
        console.error('Failed to fetch integrations:', error);
      },
    }
  );
}

// Mutation hook for data modifications
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await mutationFn(variables);
      
      if (options.onSuccess) {
        options.onSuccess(data, variables);
      }
      
      if (options.onSettled) {
        options.onSettled(data, null, variables);
      }
      
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (options.onError) {
        options.onError(error, variables);
      }
      
      if (options.onSettled) {
        options.onSettled(null, error, variables);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return {
    mutate,
    loading,
    error,
    isValidationError: error instanceof ValidationError,
    isNetworkError: error instanceof NetworkError,
    isApiError: error instanceof ApiError,
  };
}

// Real-time data synchronization hook
export function useRealTimeSync<T>(
  apiCall: () => Promise<T>,
  interval: number = 30000, // 30 seconds default
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const sync = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      setLastSync(new Date());
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('[Real-time sync error]:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    // Initial sync
    sync();

    // Set up interval for real-time updates
    const intervalId = setInterval(sync, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [sync, interval]);

  return {
    data,
    loading,
    error,
    lastSync,
    sync,
  };
}