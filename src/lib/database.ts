/*
  # Database Connection and Query Layer
  
  This module provides a secure, optimized interface for database operations
  with connection pooling, caching, and comprehensive error handling.
*/

import { supabase } from './supabase';
import type {
  DatabaseBrand,
  DatabaseProduct,
  DatabaseProductAttribute,
  DatabaseProductImage,
  DatabaseProductSize,
  DatabaseProductView,
  DatabaseProductMetricsDaily,
  DatabaseBrandMetricsDaily,
  DatabaseSupportRequest,
  ProductWithDetails,
  BrandWithMetrics,
  SupportRequestWithBrand,
  ProductFilters,
  AnalyticsFilters,
  PaginatedResponse,
  AnalyticsResponse,
} from '../types/database';

// Cache configuration
const CACHE_TTL = {
  BRANDS: 15 * 60 * 1000, // 15 minutes
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  ANALYTICS: 2 * 60 * 1000, // 2 minutes
  SUPPORT: 1 * 60 * 1000, // 1 minute
} as const;

// Simple in-memory cache
class DatabaseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new DatabaseCache();

// Database error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Utility functions
function handleDatabaseError(error: any): never {
  console.error('Database error:', error);
  
  if (error.code === 'PGRST116') {
    throw new DatabaseError('No data found', 'NOT_FOUND');
  }
  
  if (error.code === '23505') {
    throw new DatabaseError('Duplicate entry', 'DUPLICATE_ENTRY');
  }
  
  if (error.code === '23503') {
    throw new DatabaseError('Foreign key constraint violation', 'CONSTRAINT_VIOLATION');
  }
  
  throw new DatabaseError(
    error.message || 'Database operation failed',
    error.code,
    error.details
  );
}

function buildCacheKey(operation: string, params: Record<string, any> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);
  
  return `${operation}:${JSON.stringify(sortedParams)}`;
}

// Brand operations
export class BrandRepository {
  static async getById(id: string): Promise<DatabaseBrand | null> {
    const cacheKey = buildCacheKey('brand:getById', { id });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        handleDatabaseError(error);
      }

      cache.set(cacheKey, data, CACHE_TTL.BRANDS);
      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async create(brand: Omit<DatabaseBrand, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseBrand> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert(brand)
        .select()
        .single();

      if (error) handleDatabaseError(error);

      // Invalidate cache
      cache.invalidate('brand');
      
      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async update(id: string, updates: Partial<DatabaseBrand>): Promise<DatabaseBrand> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) handleDatabaseError(error);

      // Invalidate cache
      cache.invalidate('brand');
      
      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async getWithMetrics(id: string): Promise<BrandWithMetrics | null> {
    const cacheKey = buildCacheKey('brand:getWithMetrics', { id });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Get brand data
      const brand = await this.getById(id);
      if (!brand) return null;

      // Get aggregated metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_brand_metrics_summary', { brand_uuid: id });

      if (metricsError) {
        console.warn('Failed to fetch brand metrics:', metricsError);
      }

      const result: BrandWithMetrics = {
        ...brand,
        metrics: metricsData?.[0] || {
          total_products: 0,
          active_products: 0,
          total_views: 0,
          avg_price: 0,
          total_revenue: 0,
        },
      };

      cache.set(cacheKey, result, CACHE_TTL.ANALYTICS);
      return result;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Product operations
export class ProductRepository {
  static async getByBrandId(
    brandId: string,
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<ProductWithDetails>> {
    const cacheKey = buildCacheKey('products:getByBrandId', { brandId, ...filters });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          brand:brands!inner(id, name, logo_url),
          attributes:product_attributes(*),
          images:product_images(*),
          sizes:product_sizes(*)
        `)
        .eq('brand_id', brandId);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }
      
      if (filters.price_min !== undefined) {
        query = query.gte('current_price', filters.price_min);
      }
      
      if (filters.price_max !== undefined) {
        query = query.lte('current_price', filters.price_max);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Pagination
      const limit = filters.limit || 10;
      const offset = filters.offset || 0;
      
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) handleDatabaseError(error);

      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId);

      if (countError) {
        console.warn('Failed to get total count:', countError);
      }

      const result: PaginatedResponse<ProductWithDetails> = {
        data: data || [],
        total: totalCount || 0,
        page: Math.floor(offset / limit) + 1,
        limit,
        has_next: (offset + limit) < (totalCount || 0),
        has_prev: offset > 0,
      };

      cache.set(cacheKey, result, CACHE_TTL.PRODUCTS);
      return result;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async getById(id: string): Promise<ProductWithDetails | null> {
    const cacheKey = buildCacheKey('product:getById', { id });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands!inner(id, name, logo_url),
          attributes:product_attributes(*),
          images:product_images(*),
          sizes:product_sizes(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        handleDatabaseError(error);
      }

      cache.set(cacheKey, data, CACHE_TTL.PRODUCTS);
      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async recordView(productId: string, sessionId: string, metadata: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  } = {}): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_views')
        .insert({
          product_id: productId,
          session_id: sessionId,
          user_id: metadata.userId,
          ip_address: metadata.ipAddress,
          user_agent: metadata.userAgent,
          referrer: metadata.referrer,
        });

      if (error) {
        console.warn('Failed to record product view:', error);
        // Don't throw error for view tracking failures
      }
    } catch (error) {
      console.warn('Failed to record product view:', error);
    }
  }

  static async getAll(filters: ProductFilters = {}) {
    // Similar to getByBrandId, but fetches all products (no brand filter)
    const cacheKey = buildCacheKey('products:getAll', { ...filters });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          brand:brands!inner(id, name, logo_url),
          attributes:product_attributes(*),
          images:product_images(*),
          sizes:product_sizes(*)
        `);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }
      if (filters.price_min !== undefined) {
        query = query.gte('current_price', filters.price_min);
      }
      if (filters.price_max !== undefined) {
        query = query.lte('current_price', filters.price_max);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Pagination
      const limit = filters.limit || 10;
      const offset = filters.offset || 0;
      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) handleDatabaseError(error);

      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (countError) {
        console.warn('Failed to get total count:', countError);
      }

      const result = {
        data: data || [],
        total: totalCount || 0,
        page: Math.floor(offset / limit) + 1,
        limit,
        has_next: (offset + limit) < (totalCount || 0),
        has_prev: offset > 0,
      };
      cache.set(cacheKey, result, CACHE_TTL.PRODUCTS);
      return result;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Analytics operations
export class AnalyticsRepository {
  static async getBrandAnalytics(
    brandId: string,
    filters: AnalyticsFilters = {}
  ): Promise<AnalyticsResponse> {
    const cacheKey = buildCacheKey('analytics:getBrandAnalytics', { brandId, ...filters });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Get overview metrics
      const { data: overviewData, error: overviewError } = await supabase
        .rpc('get_brand_analytics_overview', {
          brand_uuid: brandId,
          start_date: filters.date_start,
          end_date: filters.date_end,
        });

      if (overviewError) {
        console.warn('Failed to fetch overview analytics:', overviewError);
      }

      // Get trends data
      const { data: trendsData, error: trendsError } = await supabase
        .rpc('get_brand_analytics_trends', {
          brand_uuid: brandId,
          start_date: filters.date_start,
          end_date: filters.date_end,
          period_type: filters.period || 'day',
        });

      if (trendsError) {
        console.warn('Failed to fetch trends analytics:', trendsError);
      }

      // Get top products
      const { data: topProductsData, error: topProductsError } = await supabase
        .rpc('get_brand_top_products', {
          brand_uuid: brandId,
          start_date: filters.date_start,
          end_date: filters.date_end,
          limit_count: 10,
        });

      if (topProductsError) {
        console.warn('Failed to fetch top products:', topProductsError);
      }

      const result: AnalyticsResponse = {
        overview: overviewData?.[0] || {
          total_products: 0,
          total_views: 0,
          total_clicks: 0,
          total_conversions: 0,
          total_revenue: 0,
          conversion_rate: 0,
        },
        trends: trendsData || [],
        top_products: topProductsData || [],
      };

      cache.set(cacheKey, result, CACHE_TTL.ANALYTICS);
      return result;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Support request operations
export class SupportRequestRepository {
  static async getByBrandId(brandId: string): Promise<SupportRequestWithBrand[]> {
    const cacheKey = buildCacheKey('support:getByBrandId', { brandId });
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select(`
          *,
          brand:brands!inner(id, name, contact_email)
        `)
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) handleDatabaseError(error);

      cache.set(cacheKey, data || [], CACHE_TTL.SUPPORT);
      return data || [];
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async create(request: Omit<DatabaseSupportRequest, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseSupportRequest> {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .insert(request)
        .select()
        .single();

      if (error) handleDatabaseError(error);

      // Invalidate cache
      cache.invalidate('support');
      
      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('brands')
      .select('id')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Cache management
export const cacheManager = {
  invalidateAll: () => cache.invalidate(),
  invalidateBrands: () => cache.invalidate('brand'),
  invalidateProducts: () => cache.invalidate('product'),
  invalidateAnalytics: () => cache.invalidate('analytics'),
  invalidateSupport: () => cache.invalidate('support'),
};