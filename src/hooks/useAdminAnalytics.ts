import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface AdminAnalyticsData {
  overview: {
    totalBrands: number;
    totalProducts: number;
    totalViews: number;
    totalRevenue: number;
    brandGrowth: number;
    productGrowth: number;
    revenueGrowth: number;
    conversionRate: number;
  };
  brandGrowthData: Array<{
    month: string;
    brands: number;
    products: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  topBrands: Array<{
    id: string;
    name: string;
    productCount: number;
    revenue: number;
    clicks: number;
    status: string;
    joinDate: string;
  }>;
  recentActivity: Array<{
    type: "brand_joined" | "product_added" | "product_approved";
    brandName: string;
    productName?: string;
    timestamp: string;
  }>;
  statusDistribution: {
    activeBrands: number;
    pausedBrands: number;
    suspendedBrands: number;
    activeProducts: number;
    pendingProducts: number;
    inactiveProducts: number;
  };
}

interface UseAdminAnalyticsReturn {
  data: AdminAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useAdminAnalytics(): UseAdminAnalyticsReturn {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        brandsResult,
        productsResult,
        previousBrandsResult,
        previousProductsResult,
        recentBrandsResult,
        recentProductsResult,
      ] = await Promise.all([
        // Current brands count and data
        supabase
          .from("brands")
          .select("id, name, status, created_at")
          .order("created_at", { ascending: false }),

        // Current products count and data with brand info
        supabase
          .from("products")
          .select(
            `
            id, name, category, status, created_at, current_price,
            brand:brands(id, name, status)
          `
          )
          .order("created_at", { ascending: false }),

        // Brands from previous month for growth calculation
        supabase
          .from("brands")
          .select("id")
          .lt(
            "created_at",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          ),

        // Products from previous month for growth calculation
        supabase
          .from("products")
          .select("id")
          .lt(
            "created_at",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          ),

        // Recent brands (last 6 months for trend data)
        supabase
          .from("brands")
          .select("created_at")
          .gte(
            "created_at",
            new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order("created_at", { ascending: true }),

        // Recent products (last 6 months for trend data)
        supabase
          .from("products")
          .select("created_at")
          .gte(
            "created_at",
            new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order("created_at", { ascending: true }),
      ]);

      if (brandsResult.error) throw brandsResult.error;
      if (productsResult.error) throw productsResult.error;

      const brands = brandsResult.data || [];
      const products = productsResult.data || [];
      const previousBrands = previousBrandsResult.data || [];
      const previousProducts = previousProductsResult.data || [];
      const recentBrands = recentBrandsResult.data || [];
      const recentProducts = recentProductsResult.data || [];

      // Calculate growth rates
      const currentBrandCount = brands.length;
      const previousBrandCount = previousBrands.length;
      const brandGrowth =
        previousBrandCount > 0
          ? ((currentBrandCount - previousBrandCount) / previousBrandCount) *
            100
          : 0;

      const currentProductCount = products.length;
      const previousProductCount = previousProducts.length;
      const productGrowth =
        previousProductCount > 0
          ? ((currentProductCount - previousProductCount) /
              previousProductCount) *
            100
          : 0;

      // Calculate category distribution
      const categoryMap = new Map<string, number>();
      products.forEach((product) => {
        const category = product.category || "Uncategorized";
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const totalProducts = products.length;
      const categoryDistribution = Array.from(categoryMap.entries()).map(
        ([name, count]) => ({
          name,
          value:
            totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0,
          count,
        })
      );

      // Calculate top brands by product count
      const brandProductMap = new Map<string, any>();
      products.forEach((product) => {
        if (
          product.brand &&
          Array.isArray(product.brand) &&
          product.brand.length > 0
        ) {
          const brand = product.brand[0]; // Take first brand if it's an array
          const existingBrand = brandProductMap.get(brand.id);
          if (existingBrand) {
            existingBrand.productCount += 1;
            existingBrand.revenue += product.current_price || 0;
            existingBrand.clicks += Math.floor(Math.random() * 100) + 50; // Random clicks between 50-150
          } else {
            brandProductMap.set(brand.id, {
              id: brand.id,
              name: brand.name,
              productCount: 1,
              revenue: product.current_price || 0,
              clicks: Math.floor(Math.random() * 100) + 50, // Random clicks between 50-150
              status: brand.status,
            });
          }
        } else if (product.brand && !Array.isArray(product.brand)) {
          // Handle case where brand is a direct object
          const brand = product.brand as any;
          const existingBrand = brandProductMap.get(brand.id);
          if (existingBrand) {
            existingBrand.productCount += 1;
            existingBrand.revenue += product.current_price || 0;
            existingBrand.clicks += Math.floor(Math.random() * 100) + 50; // Random clicks between 50-150
          } else {
            brandProductMap.set(brand.id, {
              id: brand.id,
              name: brand.name,
              productCount: 1,
              revenue: product.current_price || 0,
              clicks: Math.floor(Math.random() * 100) + 50, // Random clicks between 50-150
              status: brand.status,
            });
          }
        }
      });

      // Add join dates for brands
      const topBrands = Array.from(brandProductMap.values())
        .map((brand) => {
          const brandData = brands.find((b) => b.id === brand.id);
          return {
            ...brand,
            joinDate: brandData?.created_at || "",
          };
        })
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, 10);

      // Generate monthly growth data for the last 6 months
      const monthlyData = new Map<
        string,
        { brands: number; products: number }
      >();

      // Initialize months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString("en-US", { month: "short" });
        monthlyData.set(monthKey, { brands: 0, products: 0 });
      }

      // Count brands by month
      recentBrands.forEach((brand) => {
        const month = new Date(brand.created_at).toLocaleDateString("en-US", {
          month: "short",
        });
        const data = monthlyData.get(month);
        if (data) data.brands += 1;
      });

      // Count products by month
      recentProducts.forEach((product) => {
        const month = new Date(product.created_at).toLocaleDateString("en-US", {
          month: "short",
        });
        const data = monthlyData.get(month);
        if (data) data.products += 1;
      });

      const brandGrowthData = Array.from(monthlyData.entries()).map(
        ([month, data]) => ({
          month,
          brands: data.brands,
          products: data.products,
        })
      );

      // Calculate status distribution
      const activeBrands = brands.filter((b) => b.status === "active").length;
      const pausedBrands = brands.filter((b) => b.status === "paused").length;
      const suspendedBrands = brands.filter(
        (b) => b.status === "suspended"
      ).length;

      const activeProducts = products.filter(
        (p) => p.status === "active"
      ).length;
      const pendingProducts = products.filter(
        (p) => p.status === "pending"
      ).length;
      const inactiveProducts = products.filter(
        (p) => p.status === "inactive"
      ).length;

      // Generate recent activity
      const recentActivity = [
        ...brands.slice(0, 5).map((brand) => ({
          type: "brand_joined" as const,
          brandName: brand.name,
          timestamp: brand.created_at,
        })),
        ...products.slice(0, 5).map((product) => ({
          type: "product_added" as const,
          brandName:
            product.brand &&
            Array.isArray(product.brand) &&
            product.brand.length > 0
              ? product.brand[0].name
              : product.brand && !Array.isArray(product.brand)
              ? (product.brand as any).name
              : "Unknown Brand",
          productName: product.name,
          timestamp: product.created_at,
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 8);

      // Calculate total revenue and growth
      const totalRevenue = products.reduce(
        (sum, product) => sum + (product.current_price || 0),
        0
      );

      // Calculate previous month revenue for growth
      const previousMonthProducts = products.filter(
        (product) =>
          new Date(product.created_at) <
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      const previousRevenue = previousMonthProducts.reduce(
        (sum, product) => sum + (product.current_price || 0),
        0
      );
      const revenueGrowth =
        previousRevenue > 0
          ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
          : 0;

      const conversionRate =
        products.length > 0 ? (activeProducts / products.length) * 100 : 0;

      const analyticsData: AdminAnalyticsData = {
        overview: {
          totalBrands: currentBrandCount,
          totalProducts: currentProductCount,
          totalViews: currentProductCount * 45, // Sample click data - approximate 45 clicks per product
          totalRevenue,
          brandGrowth,
          productGrowth,
          revenueGrowth,
          conversionRate,
        },
        brandGrowthData,
        categoryDistribution,
        topBrands,
        recentActivity,
        statusDistribution: {
          activeBrands,
          pausedBrands,
          suspendedBrands,
          activeProducts,
          pendingProducts,
          inactiveProducts,
        },
      };

      setData(analyticsData);
    } catch (err) {
      console.error("Error fetching admin analytics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refreshData,
  };
}
