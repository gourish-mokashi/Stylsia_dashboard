/*
  # Product Data Hook
  
  Custom React hook for managing product data with pagination,
  filtering, and real-time updates.
*/

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProductRepository, DatabaseError } from '../lib/database';
import type { ProductWithDetails, ProductFilters, PaginatedResponse } from '../types/database';

interface UseProductDataReturn {
  products: ProductWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  refreshData: () => Promise<void>;
  recordProductView: (productId: string) => Promise<void>;
}

export function useProductData(initialFilters: ProductFilters = {}): UseProductDataReturn {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    limit: 10,
    offset: 0,
    ...initialFilters,
  });

  const fetchProducts = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      const response = await ProductRepository.getByBrandId(user.id, filters);
      
      setProducts(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        hasNext: response.has_next,
        hasPrev: response.has_prev,
      });
    } catch (err) {
      console.error('Failed to fetch products:', err);
      
      if (err instanceof DatabaseError) {
        setError(err.message);
      } else {
        setError('Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters]);

  const recordProductView = useCallback(async (productId: string) => {
    try {
      // Generate a session ID if not available
      const sessionId = sessionStorage.getItem('session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId);
      }

      await ProductRepository.recordView(productId, sessionId, {
        userId: user?.id,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });
    } catch (err) {
      console.warn('Failed to record product view:', err);
      // Don't throw error for view tracking failures
    }
  }, [user?.id]);

  const refreshData = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: newFilters.offset ?? 0, // Reset offset when filters change
    }));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    pagination,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    refreshData,
    recordProductView,
  };
}