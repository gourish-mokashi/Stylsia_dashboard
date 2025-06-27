import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AnalyticsRepository, DatabaseError } from '../lib/database';
import type { AnalyticsFilters, AnalyticsResponse } from '../types/database';

interface UseAnalyticsDataReturn {
  analytics: AnalyticsResponse | null;
  loading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
  refreshData: () => Promise<void>;
}

export function useAnalyticsData(initialFilters: AnalyticsFilters = {}): UseAnalyticsDataReturn {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: 'week',
    ...initialFilters,
  });

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      const analyticsData = await AnalyticsRepository.getBrandAnalytics(user.id, filters);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      
      if (err instanceof DatabaseError) {
        setError(err.message);
      } else {
        setError('Failed to load analytics data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters]);

  const refreshData = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const updateFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    refreshData,
  };
}