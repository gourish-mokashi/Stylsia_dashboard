import { useState } from "react";
import {
  Search,
  MoreVertical,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Info,
  Users,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { useAdminBrands } from "../../hooks/useAdminBrands";
import type { DatabaseBrand } from "../../types/database";

interface BrandWithStats extends DatabaseBrand {
  product_count: number;
  last_activity: string | null;
}

interface BrandManagementState {
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  currentPage: number;
  itemsPerPage: number;
}

export default function BrandManagement() {
  const [state, setState] = useState<BrandManagementState>({
    searchTerm: "",
    statusFilter: "all",
    sortBy: "name",
    sortOrder: "asc",
    currentPage: 1,
    itemsPerPage: 10,
  });

  const [selectedBrand, setSelectedBrand] = useState<BrandWithStats | null>(
    null
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    type: "pause" | "activate";
    brand: BrandWithStats | null;
  }>({ show: false, type: "pause", brand: null });

  const { brands, loading, error, refreshData, updateBrandStatus } =
    useAdminBrands();

  const filteredBrands = brands
    .filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        (brand.contact_email &&
          brand.contact_email
            .toLowerCase()
            .includes(state.searchTerm.toLowerCase()));
      const matchesStatus =
        state.statusFilter === "all" || brand.status === state.statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[state.sortBy as keyof BrandWithStats];
      const bValue = b[state.sortBy as keyof BrandWithStats];

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      if (state.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / state.itemsPerPage);
  const paginatedBrands = filteredBrands.slice(
    (state.currentPage - 1) * state.itemsPerPage,
    state.currentPage * state.itemsPerPage
  );

  const handleSort = (field: string) => {
    setState((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handleToggleStatus = (brand: BrandWithStats) => {
    setShowConfirmDialog({
      show: true,
      type: brand.status === "active" ? "pause" : "activate",
      brand,
    });
  };

  const confirmAction = async () => {
    if (!showConfirmDialog.brand) return;

    const { brand, type } = showConfirmDialog;

    try {
      // Toggle status
      const newStatus = type === "activate" ? "active" : "suspended";
      await updateBrandStatus(brand.id, newStatus);
    } catch (error) {
      console.error("Error performing action:", error);
    }

    setShowConfirmDialog({ show: false, type: "pause", brand: null });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <CheckCircle className="h-4 w-4 text-amber-500" />;
      case "suspended":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-slate-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Brand Management
              </h1>
              <p className="text-slate-600 mt-1">Loading brand data...</p>
            </div>
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Total Brands: ...
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-16 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Brand Management
              </h1>
              <p className="text-slate-600 mt-1">Error loading brand data</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to Load Brands
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
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Total Brand Count */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Brand Management
            </h1>
            <p className="text-slate-600 mt-1">
              Manage and monitor all brands on the platform
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-bold text-blue-900">
                Total Brands: {brands.length}
              </span>
            </div>
            <Button onClick={refreshData} icon={RefreshCw} variant="outline">
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search brands by name or email..."
                  value={state.searchTerm}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      searchTerm: e.target.value,
                      currentPage: 1,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-3">
              <select
                value={state.statusFilter}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    statusFilter: e.target.value,
                    currentPage: 1,
                  }))
                }
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Brand Overview Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {filteredBrands.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {state.searchTerm ? "No brands found" : "No brands registered"}
              </h3>
              <p className="text-slate-600">
                {state.searchTerm
                  ? "Try adjusting your search terms."
                  : "Brands will appear here once they register on the platform."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200">
                  {paginatedBrands.map((brand) => (
                    <BrandMobileCard
                      key={brand.id}
                      brand={brand}
                      onInfo={() => setSelectedBrand(brand)}
                      onToggleStatus={() => handleToggleStatus(brand)}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th
                        onClick={() => handleSort("name")}
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Brand Name</span>
                          {state.sortBy === "name" && (
                            <span className="text-blue-500">
                              {state.sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("product_count")}
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Product Count</span>
                          {state.sortBy === "product_count" && (
                            <span className="text-blue-500">
                              {state.sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedBrands.map((brand) => (
                      <BrandTableRow
                        key={brand.id}
                        brand={brand}
                        onInfo={() => setSelectedBrand(brand)}
                        onToggleStatus={() => handleToggleStatus(brand)}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-slate-200 sm:px-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                    <div className="text-sm text-slate-700 text-center sm:text-left">
                      Showing {(state.currentPage - 1) * state.itemsPerPage + 1}{" "}
                      to{" "}
                      {Math.min(
                        state.currentPage * state.itemsPerPage,
                        filteredBrands.length
                      )}{" "}
                      of {filteredBrands.length} brands
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={state.currentPage === 1}
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            currentPage: prev.currentPage - 1,
                          }))
                        }
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-1 text-sm text-slate-700">
                        Page {state.currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={state.currentPage === totalPages}
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            currentPage: prev.currentPage + 1,
                          }))
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Brand Details Modal */}
        {selectedBrand && (
          <BrandDetailModal
            brand={selectedBrand}
            onClose={() => setSelectedBrand(null)}
            getStatusColor={getStatusColor}
            formatTimeAgo={formatTimeAgo}
          />
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog.show && showConfirmDialog.brand && (
          <ConfirmationDialog
            type={showConfirmDialog.type}
            brand={showConfirmDialog.brand}
            onConfirm={confirmAction}
            onCancel={() =>
              setShowConfirmDialog({ show: false, type: "pause", brand: null })
            }
          />
        )}
      </div>
    </div>
  );
}

// Brand Mobile Card Component
function BrandMobileCard({
  brand,
  onInfo,
  onToggleStatus,
  getStatusColor,
}: {
  brand: BrandWithStats;
  onInfo: () => void;
  onToggleStatus: () => void;
  getStatusColor: (status: string) => string;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="p-4 relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-medium text-slate-900">{brand.name}</h3>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                brand.status
              )}`}
            >
              {brand.status}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            {brand.contact_email || "No email"}
          </p>
          <div className="mt-2 text-sm text-slate-500">
            <span className="font-medium">{brand.product_count}</span> products
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Joined: {new Date(brand.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-slate-400 hover:text-slate-600"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-32">
              <button
                onClick={() => {
                  onInfo();
                  setShowActions(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center"
              >
                <Info className="h-3 w-3 mr-2" />
                Info
              </button>
              <button
                onClick={() => {
                  onToggleStatus();
                  setShowActions(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center"
              >
                {brand.status === "active" ? (
                  <Pause className="h-3 w-3 mr-2" />
                ) : (
                  <Play className="h-3 w-3 mr-2" />
                )}
                {brand.status === "active" ? "Pause" : "Activate"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Brand Table Row Component
function BrandTableRow({
  brand,
  onInfo,
  onToggleStatus,
  getStatusIcon,
  getStatusColor,
}: {
  brand: BrandWithStats;
  onInfo: () => void;
  onToggleStatus: () => void;
  getStatusIcon: (status: string) => JSX.Element | null;
  getStatusColor: (status: string) => string;
}) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-slate-900">{brand.name}</div>
          <div className="text-sm text-slate-500">
            {brand.contact_email || "No email"}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Joined: {new Date(brand.created_at).toLocaleDateString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-900 font-medium">
          {brand.product_count}
        </div>
        <div className="text-sm text-slate-500">products</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(brand.status)}
          <span
            className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              brand.status
            )}`}
          >
            {brand.status}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onInfo}
            icon={Info}
            className="text-blue-600 hover:text-blue-700"
          >
            Info
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleStatus}
            icon={brand.status === "active" ? Pause : Play}
            className={
              brand.status === "active"
                ? "text-amber-600 hover:text-amber-700"
                : "text-green-600 hover:text-green-700"
            }
          >
            {brand.status === "active" ? "Pause" : "Activate"}
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Brand Detail Modal Component
function BrandDetailModal({
  brand,
  onClose,
  getStatusColor,
  formatTimeAgo,
}: {
  brand: BrandWithStats;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  formatTimeAgo: (dateString: string | null) => string;
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-slate-900">
                Brand Details
              </h3>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  brand.status
                )}`}
              >
                {brand.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Brand Name
                </label>
                <p className="mt-1 text-sm text-slate-900">{brand.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Contact Email
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {brand.contact_email || "Not provided"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {brand.contact_phone || "Not provided"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Website
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {brand.website || "Not provided"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Product Count
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {brand.product_count} products
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Join Date
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {new Date(brand.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Last Activity
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {formatTimeAgo(brand.last_activity)}
                </p>
              </div>
            </div>

            {brand.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {brand.description}
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button onClick={onClose} className="w-full sm:w-auto">
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
  brand,
  onConfirm,
  onCancel,
}: {
  type: "pause" | "activate";
  brand: BrandWithStats;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const getDialogContent = () => {
    switch (type) {
      case "pause":
        return {
          title: "Suspend Brand",
          message: `Are you sure you want to suspend ${brand.name}? This will prevent them from adding new products.`,
          confirmText: "Suspend",
          confirmClass: "bg-amber-600 hover:bg-amber-700",
        };
      case "activate":
        return {
          title: "Activate Brand",
          message: `Are you sure you want to activate ${brand.name}? This will allow them to add products again.`,
          confirmText: "Activate",
          confirmClass: "bg-green-600 hover:bg-green-700",
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
