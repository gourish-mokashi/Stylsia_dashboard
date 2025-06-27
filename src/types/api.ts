// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  version: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Data Models
export interface Brand {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  business_address?: string;
  business_type?: string;
  founded_year?: number;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  created_at: string;
  updated_at: string;
  metrics?: {
    total_products: number;
    active_products: number;
    total_views: number;
    avg_price: number;
    total_revenue: number;
  };
}

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: ProductImage[];
  style_tags: StyleTag[];
  status: 'approved' | 'pending' | 'rejected';
  sku?: string;
  category: string;
  subcategory?: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string;
  is_primary: boolean;
  order: number;
}

export interface StyleTag {
  id: string;
  name: string;
  description: string;
  category: string;
  color?: string;
  created_at: string;
}

export interface Analytics {
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

export interface ProductFilters {
  status?: Product['status'];
  category?: string;
  style_tags?: string[];
  price_min?: number;
  price_max?: number;
  search?: string;
  sort_by?: 'name' | 'price' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AnalyticsFilters {
  product_ids?: string[];
  date_start?: string;
  date_end?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  metrics?: ('views' | 'clicks' | 'conversions' | 'revenue')[];
}

export interface SupportRequest {
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

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  timestamp: string;
  details?: Record<string, any>;
}