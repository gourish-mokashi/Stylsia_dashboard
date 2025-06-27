import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrandRepository, DatabaseError } from '../lib/database';
import type { DatabaseBrand, BrandWithMetrics } from '../types/database';

interface UseBrandDataReturn {
  brand: DatabaseBrand | null;
  brandWithMetrics: BrandWithMetrics | null;
  loading: boolean;
  error: string | null;
  updateBrand: (updates: Partial<DatabaseBrand>) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useBrandData(): UseBrandDataReturn {
  const { user } = useAuth();
  const [brand, setBrand] = useState<DatabaseBrand | null>(null);
  const [brandWithMetrics, setBrandWithMetrics] = useState<BrandWithMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createDefaultBrand = useCallback(async (userId: string, userEmail: string) => {
    try {
      // Create a default brand record for the user
      const defaultBrandData = {
        id: userId,
        name: `Brand ${userEmail.split('@')[0]}`,
        contact_email: userEmail,
        status: 'active' as const,
        business_type: 'Fashion & Apparel',
      };

      const newBrand = await BrandRepository.create(defaultBrandData);
      return newBrand;
    } catch (err) {
      console.error('Failed to create default brand:', err);
      throw err;
    }
  }, []);

  const fetchBrandData = useCallback(async () => {
    if (!user?.id || !user?.email) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Try to get existing brand data
      let brandData = await BrandRepository.getById(user.id);
      
      // If no brand exists, create a default one
      if (!brandData) {
        console.log('No brand found for user, creating default brand...');
        brandData = await createDefaultBrand(user.id, user.email);
      }
      
      setBrand(brandData);
      
      // Get brand with metrics
      const brandWithMetricsData = await BrandRepository.getWithMetrics(user.id);
      setBrandWithMetrics(brandWithMetricsData);
    } catch (err) {
      console.error('Failed to fetch brand data:', err);
      
      if (err instanceof DatabaseError) {
        setError(err.message);
      } else {
        setError('Failed to load brand information. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, createDefaultBrand]);

  const updateBrand = useCallback(async (updates: Partial<DatabaseBrand>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      const updatedBrand = await BrandRepository.update(user.id, updates);
      setBrand(updatedBrand);
      
      // Refresh brand with metrics
      const brandWithMetricsData = await BrandRepository.getWithMetrics(user.id);
      setBrandWithMetrics(brandWithMetricsData);
    } catch (err) {
      console.error('Failed to update brand:', err);
      
      if (err instanceof DatabaseError) {
        throw new Error(err.message);
      } else {
        throw new Error('Failed to update brand information. Please try again.');
      }
    }
  }, [user?.id]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchBrandData();
  }, [fetchBrandData]);

  useEffect(() => {
    fetchBrandData();
  }, [fetchBrandData]);

  return {
    brand,
    brandWithMetrics,
    loading,
    error,
    updateBrand,
    refreshData,
  };
}