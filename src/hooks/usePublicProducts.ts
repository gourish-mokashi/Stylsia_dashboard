import { useState, useEffect, useCallback } from 'react';
import { ProductRepository, DatabaseError } from '../lib/database';
import type { ProductWithDetails, ProductFilters } from '../types/database';

interface UsePublicProductsReturn {
  products: ProductWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  refreshData: () => Promise<void>;
}

export function usePublicProducts(initialFilters: ProductFilters = {}): UsePublicProductsReturn {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // Separate state for infinite scroll
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    limit: 10,
    offset: 0,
    ...initialFilters,
  });

  const fetchProducts = useCallback(async (isLoadMore = false) => {
    try {
      setError(null);
      
      // Set appropriate loading state
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      // Fetch all products, not filtered by brand
      const response = await ProductRepository.getAll(filters);
      
      // For load more, append to existing products; otherwise replace
      if (isLoadMore && filters.offset && filters.offset > 0) {
        setProducts(prevProducts => {
          // Prevent duplicates by checking if last product from previous batch
          // is same as first product from new batch
          const newProducts = response.data.filter((newProduct: ProductWithDetails) => 
            !prevProducts.some(prevProduct => prevProduct.id === newProduct.id)
          );
          return [...prevProducts, ...newProducts];
        });
      } else {
        setProducts(response.data);
      }
      
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
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [filters]);

  const refreshData = useCallback(async () => {
    await fetchProducts(false);
  }, [fetchProducts]);

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    const isLoadMore = newFilters.offset && newFilters.offset > 0 && 
                      newFilters.offset > (filters.offset || 0);
    
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: newFilters.offset ?? 0,
    }));
    
    // Reset products if it's not a load more operation
    if (!isLoadMore) {
      setProducts([]);
    }
  }, [filters.offset]);

  useEffect(() => {
    const isLoadMore = Boolean(filters.offset && filters.offset > 0);
    fetchProducts(isLoadMore);
  }, [fetchProducts]);

  return {
    products,
    pagination,
    loading,
    loadingMore,
    error,
    filters,
    setFilters: updateFilters,
    refreshData,
  };
}
