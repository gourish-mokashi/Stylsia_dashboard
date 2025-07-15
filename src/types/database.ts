/*
  # Database Types and Models
  
  This file contains TypeScript interfaces that map to the database schema,
  providing type safety for all database operations.
*/

// Core database table interfaces
export interface DatabaseBrand {
  id: string;
  name: string;
  website?: string;
  logo_url?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  business_address?: string;
  business_type?: string;
  founded_year?: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface DatabaseProduct {
  id: string;
  name: string;
  source_url: string;
  brand_id: string;
  original_price: number;
  current_price: number;
  discount_percentage: number;
  category?: string;
  sub_category?: string;
  main_image_url?: string;
  description?: string;
  sku?: string;
  status: 'active' | 'inactive' | 'pending' | 'out_of_stock';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProductAttribute {
  id: string;
  product_id: string;
  fabric?: string;
  fit?: string;
  collar?: string;
  sleeve?: string;
  closure?: string;
  pattern?: string;
  occasion?: string;
  care_instructions?: string;
  material?: string;
  color?: string;
  style?: string;
  created_at: string;
}

export interface DatabaseProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_main: boolean;
  display_order: number;
  created_at: string;
}

export interface DatabaseProductSize {
  id: string;
  product_id: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '2XL' | '3XL' | 'Free Size';
  is_available: boolean;
  stock_count: number;
  created_at: string;
}

export interface DatabaseProductView {
  id: string;
  product_id: string;
  session_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  viewed_at: string;
}

export interface DatabaseProductMetricsDaily {
  id: string;
  product_id: string;
  date: string;
  views: number;
  unique_views: number;
  clicks: number;
  conversions: number;
  saves: number;
  avg_price?: number;
  discount_rate?: number;
  bounce_rate?: number;
  avg_time_spent?: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBrandMetricsDaily {
  id: string;
  brand_id: string;
  date: string;
  total_views: number;
  total_products: number;
  active_products: number;
  avg_price?: number;
  total_revenue?: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSupportRequest {
  id: string;
  brand_id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  has_attachment: boolean;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

// Joined/computed interfaces for complex queries
export interface ProductWithDetails extends DatabaseProduct {
  brand: Pick<DatabaseBrand, 'id' | 'name' | 'logo_url'>;
  attributes?: DatabaseProductAttribute;
  images: DatabaseProductImage[];
  sizes: DatabaseProductSize[];
  metrics?: {
    total_views: number;
    total_clicks: number;
    conversion_rate: number;
  };
}

export interface BrandWithMetrics extends DatabaseBrand {
  metrics: {
    total_products: number;
    active_products: number;
    total_views: number;
    avg_price: number;
    total_revenue: number;
  };
}

export interface SupportRequestWithBrand extends DatabaseSupportRequest {
  brand: Pick<DatabaseBrand, 'id' | 'name' | 'contact_email'>;
}

// Query filter interfaces
export interface ProductFilters {
  brand_id?: string;
  status?: DatabaseProduct['status'];
  category?: string;
  is_featured?: boolean;
  price_min?: number;
  price_max?: number;
  search?: string;
  has_discount?: boolean; // New filter for discount availability
  limit?: number;
  offset?: number;
  sort_by?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'random' | 'discount_desc';
}

export interface AnalyticsFilters {
  brand_id?: string;
  product_id?: string;
  date_start?: string;
  date_end?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

// Response interfaces
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AnalyticsResponse {
  overview: {
    total_products: number;
    total_views: number;
    total_clicks: number;
    total_conversions: number;
    total_revenue: number;
    conversion_rate: number;
  };
  trends: Array<{
    date: string;
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  top_products: Array<{
    product_id: string;
    product_name: string;
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
}