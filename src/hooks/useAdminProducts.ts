import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { DatabaseProduct, DatabaseBrand } from "../types/database";

interface AdminProduct extends DatabaseProduct {
  brand: Pick<DatabaseBrand, "id" | "name">;
}

interface UseAdminProductsReturn {
  products: AdminProduct[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateProductStatus: (
    productId: string,
    status: DatabaseProduct["status"]
  ) => Promise<void>;
}

export function useAdminProducts(): UseAdminProductsReturn {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select(
          `
          *,
          brand:brands!inner(
            id,
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setProducts(data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProductStatus = useCallback(
    async (productId: string, status: DatabaseProduct["status"]) => {
      try {
        const { error: updateError } = await supabase
          .from("products")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Update local state
        setProducts((prev) =>
          prev.map((product) =>
            product.id === productId
              ? { ...product, status, updated_at: new Date().toISOString() }
              : product
          )
        );
      } catch (err) {
        console.error("Failed to update product status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update product status"
        );
        throw err;
      }
    },
    []
  );

  const refreshData = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refreshData,
    updateProductStatus,
  };
}
