import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { DatabaseBrand } from '../types/database';

interface BrandWithStats extends DatabaseBrand {
  product_count: number;
  last_activity: string | null;
}

interface UseAdminBrandsReturn {
  brands: BrandWithStats[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateBrandStatus: (brandId: string, status: DatabaseBrand['status']) => Promise<void>;
}

export function useAdminBrands(): UseAdminBrandsReturn {
  const [brands, setBrands] = useState<BrandWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get all brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

      if (brandsError) {
        throw new Error(brandsError.message);
      }

      // For each brand, get product count and last activity
      const brandsWithStats: BrandWithStats[] = await Promise.all(
        (brandsData || []).map(async (brand) => {
          // Get product count
          const { count: productCount, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brand.id);

          if (countError) {
            console.warn(`Failed to get product count for brand ${brand.id}:`, countError);
          }

          // Get last product update as activity indicator
          const { data: lastProduct, error: productError } = await supabase
            .from('products')
            .select('updated_at')
            .eq('brand_id', brand.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          if (productError && productError.code !== 'PGRST116') {
            console.warn(`Failed to get last activity for brand ${brand.id}:`, productError);
          }

          return {
            ...brand,
            product_count: productCount || 0,
            last_activity: lastProduct?.updated_at || null,
          };
        })
      );

      setBrands(brandsWithStats);
    } catch (err) {
      console.error('Failed to fetch brands:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBrandStatus = useCallback(async (brandId: string, status: DatabaseBrand['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('brands')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', brandId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update local state
      setBrands(prev => prev.map(brand => 
        brand.id === brandId 
          ? { ...brand, status, updated_at: new Date().toISOString() }
          : brand
      ));
    } catch (err) {
      console.error('Failed to update brand status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update brand status');
      throw err;
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    refreshData,
    updateBrandStatus,
  };
}
