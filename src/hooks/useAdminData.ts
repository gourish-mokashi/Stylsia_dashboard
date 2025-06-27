import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface AdminStats {
  totalBrands: number;
  totalProducts: number;
  pendingProducts: number;
  activeThreads: number;
  totalMessages: number;
  monthlyRevenue: number;
  conversionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'brand_registered' | 'product_submitted' | 'message_received' | 'product_approved' | 'product_rejected';
  message: string;
  timestamp: string;
  user_email?: string;
  metadata?: Record<string, any>;
}

interface TopBrand {
  id: string;
  email: string;
  name: string;
  threadCount: number;
  messageCount: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

interface AdminDataState {
  stats: AdminStats | null;
  recentActivity: RecentActivity[];
  topBrands: TopBrand[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useAdminData() {
  const [data, setData] = useState<AdminDataState>({
    stats: null,
    recentActivity: [],
    topBrands: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchStats = useCallback(async (): Promise<AdminStats> => {
    try {
      // Get total brands by counting unique brand_ids in support_requests table
      const { data: supportRequestsData, error: supportRequestsError } = await supabase
        .from('support_requests')
        .select('brand_id')
        .not('brand_id', 'is', null);

      if (supportRequestsError) {
        console.error('Error fetching support requests:', supportRequestsError);
        throw new Error(`Failed to fetch support requests: ${supportRequestsError.message}`);
      }

      // Count unique brand IDs
      const uniqueBrandIds = new Set(supportRequestsData?.map(t => t.brand_id) || []);
      const totalBrands = uniqueBrandIds.size;

      // Get total support requests count
      const { count: totalSupportRequests, error: supportRequestsCountError } = await supabase
        .from('support_requests')
        .select('*', { count: 'exact', head: true });

      if (supportRequestsCountError) {
        console.error('Error counting support requests:', supportRequestsCountError);
        throw new Error(`Failed to count support requests: ${supportRequestsCountError.message}`);
      }

      // Get total products count
      const { count: totalProducts, error: productsError } = await supabase
        .from('support_requests')
        .select('*', { count: 'exact', head: true });

      if (productsError) {
        console.error('Error counting products:', productsError);
        throw new Error(`Failed to count products: ${productsError.message}`);
      }

      // Get active support requests (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: activeRequests, error: activeRequestsError } = await supabase
        .from('support_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('status', 'new');

      if (activeRequestsError) {
        console.error('Error counting active support requests:', activeRequestsError);
        // Don't throw here, just use 0 as fallback
      }

      // Get pending products
      const { count: pendingProducts, error: pendingError } = await supabase
        .from('support_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      if (pendingError) {
        console.error('Error counting pending support requests:', pendingError);
        // Don't throw here, just use 0 as fallback
      }

      return {
        totalBrands,
        totalProducts: totalProducts || 0,
        pendingProducts: pendingProducts || 0,
        activeThreads: activeRequests || 0,
        totalMessages: 0, // Not used anymore
        monthlyRevenue: 0, // Would need revenue tracking
        conversionRate: 0, // Would need conversion tracking
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }, []);

  const fetchRecentActivity = useCallback(async (): Promise<RecentActivity[]> => {
    try {
      // Get recent support requests as activity
      const { data: supportRequestsData, error: supportRequestsError } = await supabase
        .from('support_requests')
        .select(`
          id,
          subject,
          status,
          priority,
          created_at,
          brand_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (supportRequestsError) {
        console.error('Error fetching support requests:', supportRequestsError);
        throw new Error(`Failed to fetch support requests: ${supportRequestsError.message}`);
      }

      const activities: RecentActivity[] = [];

      // Add support request activities
      supportRequestsData?.forEach(request => {
        activities.push({
          id: `support-${request.id}`,
          type: 'product_submitted',
          message: `New ${request.priority} priority support request: "${request.subject}"`,
          timestamp: request.created_at,
          metadata: {
            requestId: request.id,
            priority: request.priority,
            status: request.status,
            brandId: request.brand_id,
          },
        });
      });

      // Sort by timestamp and return latest 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }, []);

  const fetchTopBrands = useCallback(async (): Promise<TopBrand[]> => {
    try {
      // Get all support requests with their basic info
      const { data: supportRequestsData, error: supportRequestsError } = await supabase
        .from('support_requests')
        .select(`
          brand_id,
          id,
          created_at
        `)
        .not('brand_id', 'is', null);

      if (supportRequestsError) {
        console.error('Error fetching support requests for top brands:', supportRequestsError);
        throw new Error(`Failed to fetch support requests: ${supportRequestsError.message}`);
      }

      // Group by brand_id and calculate stats
      const brandStats = new Map<string, {
        threadCount: number;
        messageCount: number;
        lastActivity: string;
      }>();

      supportRequestsData?.forEach(request => {
        if (!request.brand_id) return;

        const existing = brandStats.get(request.brand_id) || {
          threadCount: 0,
          messageCount: 0,
          lastActivity: request.created_at,
        };

        existing.threadCount += 1;
        existing.messageCount += 1; // Count each request as one product
        
        // Update last activity if this request is more recent
        if (new Date(request.created_at) > new Date(existing.lastActivity)) {
          existing.lastActivity = request.created_at;
        }

        brandStats.set(request.brand_id, existing);
      });

      // Convert to array and add user info
      const topBrands: TopBrand[] = [];
      
      for (const [brandId, stats] of brandStats.entries()) {
        // Generate display info for brand
        const brandName = `Brand ${brandId.slice(0, 8)}`;
        const brandEmail = `brand-${brandId.slice(0, 8)}@example.com`;
        
        topBrands.push({
          id: brandId,
          email: brandEmail,
          name: brandName,
          threadCount: stats.threadCount,
          messageCount: stats.messageCount,
          lastActivity: stats.lastActivity,
          status: new Date(stats.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive',
        });
      }

      // Sort by message count and return top 5
      return topBrands
        .sort((a, b) => b.messageCount - a.messageCount)
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching top brands:', error);
      throw error;
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [stats, recentActivity, topBrands] = await Promise.all([
        fetchStats(),
        fetchRecentActivity(),
        fetchTopBrands(),
      ]);

      setData({
        stats,
        recentActivity,
        topBrands,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      }));
    }
  }, [fetchStats, fetchRecentActivity, fetchTopBrands]);

  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchAllData();

    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchAllData]);

  return {
    ...data,
    refreshData,
  };
}