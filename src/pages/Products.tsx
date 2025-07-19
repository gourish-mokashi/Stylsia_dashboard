import { useState, useEffect } from "react";
import {
  Package,
  MoreVertical,
  Search,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Eye,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button";
import { useProductData } from "../hooks/useProductData";
import { PageMeta } from "../components/seo/PageMeta";
import { productsMeta } from "../config/metaData";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { ProductWithDetails } from "../types/database";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [totalCounts, setTotalCounts] = useState({
    active: 0,
    inactive: 0,
    loading: true,
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use the partner product data hook to show only products for this brand
  const {
    products,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refreshData,
  } = useProductData({
    search: searchParams.get("search") || undefined,
    status: (searchParams.get("status") as "active" | "inactive") || undefined,
    category: searchParams.get("category") || undefined,
  });

  // Fetch total counts for active and inactive products
  useEffect(() => {
    const fetchTotalCounts = async () => {
      if (!user?.id) return;

      try {
        setTotalCounts((prev) => ({ ...prev, loading: true }));

        // Get active count
        const { count: activeCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("brand_id", user.id)
          .eq("status", "active");

        // Get inactive count
        const { count: inactiveCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("brand_id", user.id)
          .eq("status", "inactive");

        setTotalCounts({
          active: activeCount || 0,
          inactive: inactiveCount || 0,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to fetch total counts:", error);
        setTotalCounts((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchTotalCounts();
  }, [user?.id]);

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    setFilters({
      ...filters,
      search: searchTerm || undefined,
      offset: 0, // Reset to first page
    });
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters({
      ...filters,
      ...newFilters,
      offset: 0, // Reset to first page
    });
  };

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * (filters.limit || 10);
    setFilters({
      ...filters,
      offset: newOffset,
    });
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Error state
  if (error) {
    return (
      <div className="container-responsive py-4 sm:py-6">
        <Header
          title="My Products"
          subtitle="Manage your product catalog and track approval status"
        />

        <div className="mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to Load Products
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={refreshData} icon={RefreshCw}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta {...productsMeta} />
      <div className="container-responsive py-4 sm:py-6">
        <Header
          title="My Products"
          subtitle="Manage your product catalog and track performance"
        />

        <div className="mt-6 space-y-6">
          {/* Product Management Info Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Product Management:</strong> Contact our support team
                  to add new products or make changes to existing listings.
                </p>
              </div>
            </div>
          </div>

          {/* Product Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Active Products Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Products
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalCounts.loading ? (
                        <span className="animate-pulse bg-gray-200 rounded h-8 w-12 inline-block"></span>
                      ) : (
                        totalCounts.active
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-green-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Total active products for your brand.
                </p>
              </div>
            </div>

            {/* Inactive Products Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Package className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Inactive Products
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalCounts.loading ? (
                        <span className="animate-pulse bg-gray-200 rounded h-8 w-12 inline-block"></span>
                      ) : (
                        totalCounts.inactive
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-red-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Total inactive products for your brand.
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={filters.category || "all"}
                  onChange={(e) =>
                    handleFilterChange({
                      category:
                        e.target.value === "all" ? undefined : e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Kids">Kids</option>
                  <option value="Sale">Sale</option>
                </select>
                <select
                  value={filters.status || "all"}
                  onChange={(e) =>
                    handleFilterChange({
                      status:
                        e.target.value === "all"
                          ? undefined
                          : (e.target.value as "active" | "inactive"),
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          )}

          {/* Products Table - Responsive design */}
          {!loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Mobile Card View - Show on mobile */}
              <div className="block sm:hidden">
                <div className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={() => handleViewProduct(product.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Table View - Show on tablet and up */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:px-6">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:px-6">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:px-6">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:px-6">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:px-6">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          onView={() => handleViewProduct(product.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination - Responsive layout */}
              {pagination.total > 0 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                    <div className="text-sm text-gray-700 text-center sm:text-left">
                      Showing{" "}
                      <span className="font-medium">
                        {pagination.page * pagination.limit -
                          pagination.limit +
                          1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span>{" "}
                      results
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasPrev}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasNext}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filters.status
                  ? "Try adjusting your search terms or filters."
                  : "Your products will appear here once they are added to the platform."}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Need to add products?</strong>
                  <br />
                  Contact our support team at support@stylsia.com to discuss
                  product onboarding options.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Product Card Component for Mobile
function ProductCard({
  product,
  onView,
}: {
  product: ProductWithDetails;
  onView: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Find main image or use first image
  const mainImage =
    product.images.find((img) => img.is_main) || product.images[0];

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        <img
          className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
          src={mainImage?.image_url || "https://via.placeholder.com/150"}
          alt={mainImage?.alt_text || product.name}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-40">
                {product.name}
              </h3>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                <div className="space-y-0.5">
                  <div>₹{product.current_price.toLocaleString("en-IN")}</div>
                  {product.discount_percentage > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs line-through text-gray-500">
                        ₹{product.original_price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-medium text-green-600 whitespace-nowrap">
                        {product.discount_percentage}% off
                      </span>
                    </div>
                  )}
                </div>
              </p>
            </div>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                product.status
              )}`}
            >
              {product.status.charAt(0).toUpperCase() +
                product.status.slice(1).replace("_", " ")}
            </span>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            {product.category || "Uncategorized"}
          </div>

          <div className="flex items-center space-x-3 mt-3">
            <button
              className="text-primary-600 hover:text-primary-900 touch-target"
              onClick={onView}
              title="View product details"
              aria-label="View product details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              className="text-gray-400 hover:text-gray-600 touch-target"
              title="More options"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Row Component for Desktop
function ProductRow({
  product,
  onView,
}: {
  product: ProductWithDetails;
  onView: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Find main image or use first image
  const mainImage =
    product.images.find((img) => img.is_main) || product.images[0];

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-4 py-4 whitespace-nowrap lg:px-6">
        <div className="flex items-center">
          <img
            className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg object-cover"
            src={mainImage?.image_url || "https://via.placeholder.com/150"}
            alt={mainImage?.alt_text || product.name}
          />
          <div className="ml-3 lg:ml-4 min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-40 lg:max-w-56">
              {product.name}
            </div>
            <div className="text-sm text-gray-500">{product.sku || "-"}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 lg:px-6">
        <div className="text-sm text-gray-900">
          {product.category || "Uncategorized"}
        </div>
        <div className="text-sm text-gray-500">
          {product.sub_category || "-"}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 lg:px-6">
        <div className="space-y-1">
          <div>₹{product.current_price.toLocaleString("en-IN")}</div>
          {product.discount_percentage > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs line-through text-gray-500">
                ₹{product.original_price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-medium text-green-600 whitespace-nowrap">
                {product.discount_percentage}% off
              </span>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap lg:px-6">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            product.status
          )}`}
        >
          {product.status.charAt(0).toUpperCase() +
            product.status.slice(1).replace("_", " ")}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium lg:px-6">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onView}
            icon={ExternalLink}
            className="text-primary-600 hover:text-primary-900"
          >
            View
          </Button>
        </div>
      </td>
    </tr>
  );
}
