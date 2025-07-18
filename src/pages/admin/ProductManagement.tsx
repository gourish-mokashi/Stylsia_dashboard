import { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Pause,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import type { DatabaseProduct, DatabaseBrand } from "../../types/database";

interface AdminProduct extends DatabaseProduct {
  brand: Pick<DatabaseBrand, "id" | "name">;
}

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null
  );
  const [showProductActions, setShowProductActions] = useState<string | null>(
    null
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    type: "pause" | "remove";
    product: AdminProduct | null;
  }>({ show: false, type: "pause", product: null });

  const { products, loading, error, refreshData } = useAdminProducts();

  const handlePauseProduct = (product: AdminProduct) => {
    setShowConfirmDialog({
      show: true,
      type: "pause",
      product,
    });
  };

  const handleRemoveProduct = (product: AdminProduct) => {
    setShowConfirmDialog({
      show: true,
      type: "remove",
      product,
    });
  };

  const confirmAction = async () => {
    if (!showConfirmDialog.product) return;

    const { product, type } = showConfirmDialog;

    try {
      // Here you would implement the actual API calls
      if (type === "pause") {
        // Update product status to inactive
        console.log("Pausing product:", product.id);
        // await updateProductStatus(product.id, "inactive");
      } else if (type === "remove") {
        // Remove/delete product
        console.log("Removing product:", product.id);
        // await removeProduct(product.id);
      }

      // Refresh the data after action
      await refreshData();
    } catch (error) {
      console.error("Error performing action:", error);
    }

    setShowConfirmDialog({ show: false, type: "pause", product: null });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand &&
        typeof product.brand === "object" &&
        "name" in product.brand &&
        product.brand.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Product Management
            </h1>
            <p className="text-slate-600">Loading products...</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Product Management
            </h1>
            <p className="text-slate-600">Review and manage products</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Failed to Load Products
            </h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button
              onClick={refreshData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Product Management
            </h1>
            <p className="text-slate-600">
              Review and approve product submissions
            </p>
          </div>
          <Button onClick={refreshData} variant="outline" className="text-sm">
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Total Products</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Active Products</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.filter((p) => p.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Inactive Products</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.filter((p) => p.status === "inactive").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products or brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button variant="outline" icon={Filter}>
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider lg:px-6">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider lg:px-6">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider lg:px-6">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider lg:px-6">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider lg:px-6">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider lg:px-6">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider lg:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-4 whitespace-nowrap lg:px-6">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg object-cover"
                          src={
                            product.main_image_url ||
                            "https://via.placeholder.com/150"
                          }
                          alt={product.name}
                        />
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-900 truncate max-w-32 sm:max-w-40 lg:max-w-56">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 lg:px-6">
                      <div className="text-sm text-slate-900">
                        {product.brand &&
                        typeof product.brand === "object" &&
                        "name" in product.brand
                          ? product.brand.name
                          : "Unknown Brand"}
                      </div>
                    </td>
                    <td className="px-4 py-4 lg:px-6">
                      <div className="text-sm text-slate-900">
                        {product.category || "Uncategorized"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {product.sub_category || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 lg:px-6">
                      ₹{product.current_price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap lg:px-6">
                      <div className="flex items-center">
                        {getStatusIcon(product.status)}
                        <span
                          className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {product.status.charAt(0).toUpperCase() +
                            product.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 lg:px-6">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium lg:px-6">
                      <div className="flex items-center space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                          onClick={() => setSelectedProduct(product)}
                          title="View product details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button
                            className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                            onClick={() =>
                              setShowProductActions(
                                showProductActions === product.id
                                  ? null
                                  : product.id
                              )
                            }
                            title="Product actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {showProductActions === product.id && (
                            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-32">
                              <button
                                onClick={() => {
                                  handlePauseProduct(product);
                                  setShowProductActions(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center text-amber-600"
                              >
                                <Pause className="h-3 w-3 mr-2" />
                                {product.status === "active"
                                  ? "Pause"
                                  : "Activate"}
                              </button>
                              <button
                                onClick={() => {
                                  handleRemoveProduct(product);
                                  setShowProductActions(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center text-red-600"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">
              No products found matching your criteria.
            </p>
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
          />
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog.show && showConfirmDialog.product && (
          <ConfirmationDialog
            type={showConfirmDialog.type}
            product={showConfirmDialog.product}
            onConfirm={confirmAction}
            onCancel={() =>
              setShowConfirmDialog({
                show: false,
                type: "pause",
                product: null,
              })
            }
          />
        )}
      </div>
    </div>
  );
}

function ProductDetailModal({
  product,
  onClose,
  getStatusIcon,
  getStatusColor,
}: {
  product: AdminProduct;
  onClose: () => void;
  getStatusIcon: (status: string) => JSX.Element | null;
  getStatusColor: (status: string) => string;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">
              Product Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div>
                {product.main_image_url ? (
                  <img
                    src={product.main_image_url}
                    alt={product.name}
                    className="w-full h-64 object-contain rounded-lg bg-slate-50"
                  />
                ) : (
                  <div className="w-full h-64 bg-slate-200 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400">No image available</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Product Name
                  </label>
                  <p className="mt-1 text-sm text-slate-900">{product.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Brand
                  </label>
                  <p className="mt-1 text-sm text-slate-900">
                    {product.brand &&
                    typeof product.brand === "object" &&
                    "name" in product.brand
                      ? product.brand.name
                      : "Unknown Brand"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <p className="mt-1 text-sm text-slate-900">
                    {product.category || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Price
                  </label>
                  <p className="mt-1 text-sm text-slate-900">
                    ₹{product.current_price.toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <div className="mt-1 flex items-center">
                    {getStatusIcon(product.status)}
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <div className="bg-slate-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {product.description || "No description available"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirmation Dialog Component
function ConfirmationDialog({
  type,
  product,
  onConfirm,
  onCancel,
}: {
  type: "pause" | "remove";
  product: AdminProduct;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const getDialogContent = () => {
    switch (type) {
      case "pause":
        return {
          title:
            product.status === "active" ? "Pause Product" : "Activate Product",
          message:
            product.status === "active"
              ? `Are you sure you want to pause "${product.name}"? This will make it inactive and hidden from customers.`
              : `Are you sure you want to activate "${product.name}"? This will make it visible to customers.`,
          confirmText: product.status === "active" ? "Pause" : "Activate",
          confirmClass:
            product.status === "active"
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-green-600 hover:bg-green-700",
        };
      case "remove":
        return {
          title: "Remove Product",
          message: `Are you sure you want to remove "${product.name}"? This action cannot be undone.`,
          confirmText: "Remove",
          confirmClass: "bg-red-600 hover:bg-red-700",
        };
      default:
        return {
          title: "Confirm Action",
          message: "Are you sure you want to proceed?",
          confirmText: "Confirm",
          confirmClass: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const content = getDialogContent();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
          onClick={onCancel}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-slate-900">
                  {content.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500">{content.message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${content.confirmClass}`}
              onClick={onConfirm}
            >
              {content.confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
