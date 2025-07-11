import React, { useState } from 'react';
import { Package, Edit, Trash2, MoreVertical, Search, Filter, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import { usePublicProducts } from '../hooks/usePublicProducts';
import type { ProductWithDetails } from '../types/database';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  // Use the public product data hook for customer browsing
  const {
    products,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refreshData,
  } = usePublicProducts({
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') as any || undefined,
    category: searchParams.get('category') || undefined,
  });
  // recordProductView is not needed for public browsing

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

  const handleDeleteProduct = async (productId: string) => {
    setShowDeleteConfirm(null);
    
    try {
      // In a real implementation, you would call an API to delete the product
      console.log('Delete product:', productId);
      
      // Refresh the product list
      await refreshData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <p className="text-red-700 mb-4">
              {error}
            </p>
            <Button onClick={refreshData} icon={RefreshCw}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-4 sm:py-6">
      <Header 
        title="All Products" 
        subtitle="Browse all products from Stylsia's brand partners. Use the filters to find your style!"
      />
      
      <div className="mt-6 space-y-6">
        {/* Actions Bar - Responsive layout */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
              {/* Info Section */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Product Management:</strong> Contact our support team to add new products or make changes to existing listings.
                  </p>
                </div>
              </div>
              
              {/* Search, category, and filter */}
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
                  value={filters.category || 'all'}
                  onChange={(e) => handleFilterChange({ category: e.target.value === 'all' ? undefined : e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Kids">Kids</option>
                  <option value="Sale">Sale</option>
                </select>
                <select
                  value={filters.status || 'all'}
                  onChange={(e) => handleFilterChange({ status: e.target.value === 'all' ? undefined : e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <Button variant="outline" icon={Filter} size="md">Filter</Button>
              </div>
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
                    onDelete={() => setShowDeleteConfirm(product.id)}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Table View - Show on tablet and up */}
            <div className="hidden sm:block table-responsive">
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
                      onDelete={() => setShowDeleteConfirm(product.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination - Responsive layout */}
            {pagination.total > 0 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Showing <span className="font-medium">{pagination.page * pagination.limit - pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
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
              {searchTerm || filters.status ? 'Try adjusting your search terms or filters.' : 'Your products will appear here once they are added to our platform.'}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Need to add products?</strong><br />
                Contact our support team at support@stylsia.com to discuss product onboarding options.
              </p>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirm(null)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Product
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this product? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    onClick={() => handleDeleteProduct(showDeleteConfirm)}
                    className="w-full sm:w-auto sm:ml-3 bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(null)}
                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card Component for Mobile
function ProductCard({ 
  product, 
  onView, 
  onDelete 
}: { 
  product: ProductWithDetails; 
  onView: () => void;
  onDelete: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Find main image or use first image
  const mainImage = product.images.find(img => img.is_main) || product.images[0];

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        <img
          className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
          src={mainImage?.image_url || 'https://via.placeholder.com/150'}
          alt={mainImage?.alt_text || product.name}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {product.name}
              </h3>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                ${product.current_price.toFixed(2)}
                {product.discount_percentage > 0 && (
                  <span className="ml-2 text-xs line-through text-gray-500">
                    ${product.original_price.toFixed(2)}
                  </span>
                )}
              </p>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
              {product.status.charAt(0).toUpperCase() + product.status.slice(1).replace('_', ' ')}
            </span>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {product.category || 'Uncategorized'}
          </div>
          
          <div className="flex items-center space-x-3 mt-3">
            <button 
              className="text-primary-600 hover:text-primary-900 touch-target"
              onClick={onView}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button 
              className="text-red-600 hover:text-red-900 touch-target"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 touch-target">
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
  onDelete 
}: { 
  product: ProductWithDetails; 
  onView: () => void;
  onDelete: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Find main image or use first image
  const mainImage = product.images.find(img => img.is_main) || product.images[0];

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-4 py-4 whitespace-nowrap lg:px-6">
        <div className="flex items-center">
          <img
            className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg object-cover"
            src={mainImage?.image_url || 'https://via.placeholder.com/150'}
            alt={mainImage?.alt_text || product.name}
          />
          <div className="ml-3 lg:ml-4">
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">{product.sku || '-'}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 lg:px-6">
        <div className="text-sm text-gray-900">{product.category || 'Uncategorized'}</div>
        <div className="text-sm text-gray-500">{product.sub_category || '-'}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 lg:px-6">
        ${product.current_price.toFixed(2)}
        {product.discount_percentage > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs line-through text-gray-500">
              ${product.original_price.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-green-600">
              {product.discount_percentage}% off
            </span>
          </div>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap lg:px-6">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
          {product.status.charAt(0).toUpperCase() + product.status.slice(1).replace('_', ' ')}
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
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            icon={Trash2}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}