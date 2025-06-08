import { useState, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  refreshInterval?: number;
  immediate?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void> } {
  const { refreshInterval, immediate = true } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return {
    ...state,
    refetch: fetchData,
  };
}