import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

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
  type:
    | "brand_registered"
    | "product_submitted"
    | "message_received"
    | "product_approved"
    | "product_rejected";
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
  status: "active" | "inactive";
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
      // Get brands data from brands table
      const { data: brandsData, error: brandsError } = await supabase
        .from("brands")
        .select("id, status, created_at");

      if (brandsError) {
        console.error("Error fetching brands:", brandsError);
        throw new Error(`Failed to fetch brands: ${brandsError.message}`);
      }

      const totalBrands = brandsData?.length || 0;

      // Get products data from products table
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, status, created_at");

      if (productsError) {
        console.error("Error fetching products:", productsError);
        throw new Error(`Failed to fetch products: ${productsError.message}`);
      }

      const totalProducts = productsData?.length || 0;
      const pendingProducts =
        productsData?.filter((p) => p.status === "pending").length || 0;

      // Get support requests data
      const { data: supportRequestsData, error: supportRequestsError } =
        await supabase
          .from("support_requests")
          .select("id, status, created_at, brand_id");

      if (supportRequestsError) {
        console.error("Error fetching support requests:", supportRequestsError);
        throw new Error(
          `Failed to fetch support requests: ${supportRequestsError.message}`
        );
      }

      // Count active support threads (open/new requests in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeThreads =
        supportRequestsData?.filter(
          (request) =>
            ["new", "in_progress", "reopened"].includes(request.status) &&
            new Date(request.created_at) >= thirtyDaysAgo
        ).length || 0;

      // Calculate monthly revenue (placeholder - would need actual revenue tracking)
      const monthlyRevenue = 0; // Would be calculated from actual sales/transactions

      // Calculate conversion rate (products per brand)
      const conversionRate = totalBrands > 0 ? totalProducts / totalBrands : 0;

      return {
        totalBrands,
        totalProducts,
        pendingProducts,
        activeThreads,
        totalMessages: supportRequestsData?.length || 0, // Total support requests as messages
        monthlyRevenue,
        conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }, []);

  const fetchRecentActivity = useCallback(async (): Promise<
    RecentActivity[]
  > => {
    try {
      const activities: RecentActivity[] = [];

      // Get recent brand registrations
      const { data: recentBrands, error: brandsError } = await supabase
        .from("brands")
        .select("id, name, email, created_at, status")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!brandsError && recentBrands) {
        recentBrands.forEach((brand) => {
          activities.push({
            id: `brand-${brand.id}`,
            type: "brand_registered",
            message: `New brand "${brand.name}" registered`,
            timestamp: brand.created_at,
            user_email: brand.email,
            metadata: {
              brandId: brand.id,
              status: brand.status,
            },
          });
        });
      }

      // Get recent product submissions
      const { data: recentProducts, error: productsError } = await supabase
        .from("products")
        .select(
          `
          id, 
          name, 
          status, 
          created_at,
          brand_id
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (!productsError && recentProducts) {
        recentProducts.forEach((product) => {
          const activityType =
            product.status === "pending"
              ? "product_submitted"
              : product.status === "active"
              ? "product_approved"
              : "product_rejected";

          activities.push({
            id: `product-${product.id}`,
            type: activityType,
            message: `Product "${product.name}" ${
              product.status === "pending"
                ? "submitted for review"
                : product.status === "active"
                ? "approved"
                : "rejected"
            }`,
            timestamp: product.created_at,
            metadata: {
              productId: product.id,
              brandId: product.brand_id,
              status: product.status,
            },
          });
        });
      }

      // Get recent support requests
      const { data: supportRequestsData, error: supportRequestsError } =
        await supabase
          .from("support_requests")
          .select(
            `
          id,
          subject,
          status,
          priority,
          created_at,
          brand_id
        `
          )
          .order("created_at", { ascending: false })
          .limit(5);

      if (!supportRequestsError && supportRequestsData) {
        supportRequestsData.forEach((request) => {
          activities.push({
            id: `support-${request.id}`,
            type: "message_received",
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
      }

      // Sort by timestamp and return latest 10
      return activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 10);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw error;
    }
  }, []);

  const fetchTopBrands = useCallback(async (): Promise<TopBrand[]> => {
    try {
      // Get all support requests with their basic info
      const { data: supportRequestsData, error: supportRequestsError } =
        await supabase
          .from("support_requests")
          .select(
            `
          brand_id,
          id,
          created_at
        `
          )
          .not("brand_id", "is", null);

      if (supportRequestsError) {
        console.error(
          "Error fetching support requests for top brands:",
          supportRequestsError
        );
        throw new Error(
          `Failed to fetch support requests: ${supportRequestsError.message}`
        );
      }

      // Group by brand_id and calculate stats
      const brandStats = new Map<
        string,
        {
          threadCount: number;
          messageCount: number;
          lastActivity: string;
        }
      >();

      supportRequestsData?.forEach((request) => {
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
          status:
            new Date(stats.lastActivity) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ? "active"
              : "inactive",
        });
      }

      // Sort by message count and return top 5
      return topBrands
        .sort((a, b) => b.messageCount - a.messageCount)
        .slice(0, 5);
    } catch (error) {
      console.error("Error fetching top brands:", error);
      throw error;
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

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
      console.error("Error fetching admin data:", error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch data",
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
