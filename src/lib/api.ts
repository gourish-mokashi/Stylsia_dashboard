import { supabase } from './supabase';
import type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  Product,
  Brand,
  Analytics,
  ProductFilters,
  AnalyticsFilters,
} from '../types/api';

// API Configuration
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Error Classes
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string) {
    super('NETWORK_ERROR', message);
    this.name = 'NetworkError';
  }
}

// Utility Functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(
  operation: () => Promise<T>,
  attempts: number = API_CONFIG.retryAttempts
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (attempts > 1 && error instanceof NetworkError) {
      await delay(API_CONFIG.retryDelay);
      return withRetry(operation, attempts - 1);
    }
    throw error;
  }
};

const validateResponse = <T>(response: any): ApiResponse<T> => {
  if (!response || typeof response !== 'object') {
    throw new ValidationError('Invalid response format');
  }

  if (!response.success) {
    throw new ApiError(
      response.error?.code || 'UNKNOWN_ERROR',
      response.error?.message || 'An unknown error occurred',
      response.error?.details
    );
  }

  return response as ApiResponse<T>;
};

// Cache Management
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
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

const cache = new ApiCache();

// Logging
const logApiCall = (endpoint: string, method: string, data?: any) => {
  console.log(`[API] ${method} ${endpoint}`, data ? { data } : '');
};

const logApiError = (endpoint: string, error: Error) => {
  console.error(`[API Error] ${endpoint}:`, error);
};

// API Client
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      data?: any;
      params?: Record<string, any>;
      useCache?: boolean;
      cacheTtl?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      data,
      params,
      useCache = method === 'GET',
      cacheTtl = 300000,
    } = options;

    const cacheKey = `${method}:${endpoint}:${JSON.stringify(params || {})}`;

    // Check cache for GET requests
    if (useCache && method === 'GET') {
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    logApiCall(endpoint, method, data);

    try {
      const response = await withRetry(async () => {
        // For demo purposes, we'll simulate API calls with Supabase
        // In production, this would make actual HTTP requests
        return await this.simulateApiCall<T>(endpoint, method, data, params);
      });

      const validatedResponse = validateResponse<T>(response);

      // Cache successful GET responses
      if (useCache && method === 'GET') {
        cache.set(cacheKey, validatedResponse, cacheTtl);
      }

      return validatedResponse;
    } catch (error) {
      logApiError(endpoint, error as Error);
      throw error;
    }
  }

  private async simulateApiCall<T>(
    endpoint: string,
    method: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    // Simulate network delay
    await delay(Math.random() * 300 + 100);

    // Simulate different endpoints
    switch (endpoint) {
      case '/products':
        return this.handleProductsEndpoint<T>(method, data, params);
      case '/brands/me':
        return this.handleBrandEndpoint<T>(method, data);
      case '/analytics':
        return this.handleAnalyticsEndpoint<T>(method, params);
      default:
        throw new ApiError('NOT_FOUND', `Endpoint ${endpoint} not found`);
    }
  }

  private async handleProductsEndpoint<T>(
    method: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new ApiError('UNAUTHORIZED', 'User not authenticated');
    }

    // Get products from database
    const { data: productsData, error, count } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands!inner(id, name, logo_url),
        images:product_images(*)
      `)
      .eq('brand_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError('DATABASE_ERROR', error.message);
    }

    // Apply pagination
    const page = parseInt(params?.page || '1');
    const limit = parseInt(params?.limit || '10');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = productsData?.slice(startIndex, endIndex) || [];

    if (method === 'GET') {
      return {
        data: {
          data: paginatedData,
          pagination: {
            page,
            limit,
            total: productsData?.length || 0,
            totalPages: Math.ceil((productsData?.length || 0) / limit),
            hasNext: endIndex < (productsData?.length || 0),
            hasPrev: page > 1,
          },
        } as T,
        success: true,
        message: 'Products retrieved successfully',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };
    }

    throw new ApiError('METHOD_NOT_ALLOWED', `Method ${method} not allowed for this endpoint`);
  }

  private async handleBrandEndpoint<T>(method: string, data?: any): Promise<ApiResponse<T>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new ApiError('UNAUTHORIZED', 'User not authenticated');
    }

    // Get brand from database
    const { data: brandData, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (error) {
      throw new ApiError('DATABASE_ERROR', error.message);
    }

    if (method === 'GET') {
      return {
        data: brandData as T,
        success: true,
        message: 'Brand retrieved successfully',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };
    }

    if (method === 'PUT') {
      const { data: updatedBrand, error: updateError } = await supabase
        .from('brands')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.user.id)
        .select()
        .single();

      if (updateError) {
        throw new ApiError('DATABASE_ERROR', updateError.message);
      }

      cache.invalidate('brands');
      
      return {
        data: updatedBrand as T,
        success: true,
        message: 'Brand updated successfully',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };
    }

    throw new ApiError('METHOD_NOT_ALLOWED', `Method ${method} not allowed for this endpoint`);
  }

  private async handleAnalyticsEndpoint<T>(method: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new ApiError('UNAUTHORIZED', 'User not authenticated');
    }

    // Get analytics from database
    const { data: analyticsData, error } = await supabase
      .rpc('get_brand_analytics_overview', {
        brand_uuid: user.user.id,
        start_date: params?.date_start,
        end_date: params?.date_end,
      });

    if (error) {
      throw new ApiError('DATABASE_ERROR', error.message);
    }

    // Get trends data
    const { data: trendsData, error: trendsError } = await supabase
      .rpc('get_brand_analytics_trends', {
        brand_uuid: user.user.id,
        start_date: params?.date_start,
        end_date: params?.date_end,
        period_type: params?.period || 'day',
      });

    if (trendsError) {
      console.warn('Failed to fetch trends data:', trendsError);
    }

    // Get top products
    const { data: topProductsData, error: topProductsError } = await supabase
      .rpc('get_brand_top_products', {
        brand_uuid: user.user.id,
        start_date: params?.date_start,
        end_date: params?.date_end,
      });

    if (topProductsError) {
      console.warn('Failed to fetch top products:', topProductsError);
    }

    const analytics = {
      overview: analyticsData?.[0] || {
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

    return {
      data: analytics as T,
      success: true,
      message: 'Analytics retrieved successfully',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  // Public API methods
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const response = await this.request<PaginatedResponse<Product>>('/products', {
      params: filters,
    });
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request(`/products/${id}`, {
      method: 'DELETE',
      useCache: false,
    });
    cache.invalidate('products');
  }

  async getBrand(): Promise<Brand> {
    const response = await this.request<Brand>('/brands/me');
    return response.data;
  }

  async updateBrand(brand: Partial<Brand>): Promise<Brand> {
    const response = await this.request<Brand>('/brands/me', {
      method: 'PUT',
      data: brand,
      useCache: false,
    });
    return response.data;
  }

  async getAnalytics(filters?: AnalyticsFilters): Promise<Analytics> {
    const response = await this.request<Analytics>('/analytics', {
      params: filters,
      cacheTtl: 60000, // 1 minute cache for analytics
    });
    return response.data;
  }

  // Cache management
  clearCache(pattern?: string): void {
    cache.invalidate(pattern);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();