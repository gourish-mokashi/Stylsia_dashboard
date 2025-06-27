import { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, MoreVertical } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import type { DatabaseProduct, DatabaseBrand } from '../../types/database';

interface AdminProduct extends DatabaseProduct {
  brand: Pick<DatabaseBrand, 'id' | 'name'>;
}

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  
  const { products, loading, error, refreshData, updateProductStatus } = useAdminProducts();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand && typeof product.brand === 'object' && 'name' in product.brand && 
                          product.brand.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      await updateProductStatus(productId, 'active');
    } catch (error) {
      console.error('Failed to approve product:', error);
    }
  };

  const handleReject = async (productId: string) => {
    try {
      await updateProductStatus(productId, 'inactive');
    } catch (error) {
      console.error('Failed to reject product:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
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
            <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
            <p className="text-slate-600">Review and manage products</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Products</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={refreshData} className="bg-blue-600 hover:bg-blue-700 text-white">
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
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
            <p className="text-slate-600">Review and approve product submissions</p>
          </div>
          <Button onClick={refreshData} variant="outline" className="text-sm">
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.filter(p => p.status === 'pending').length}
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
                  {products.filter(p => p.status === 'active').length}
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
                  {products.filter(p => p.status === 'inactive').length}
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
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <Button variant="outline" icon={Filter}>
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {/* Product Image */}
              <div className="aspect-w-16 aspect-h-9">
                <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                  {product.main_image_url ? (
                    <img
                      src={product.main_image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 text-sm">No image</div>
                  )}
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-slate-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-sm text-slate-600 mb-2">
                  {product.brand && typeof product.brand === 'object' && 'name' in product.brand 
                    ? product.brand.name 
                    : 'Unknown Brand'}
                </p>
                <p className="text-sm text-slate-600 mb-2">{product.category || 'No category'}</p>
                <p className="font-semibold text-slate-900 mb-3">
                  ${product.current_price.toFixed(2)}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(product.status)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Action Buttons */}
                {product.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(product.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(product.id)}
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                )}
                
                {product.status !== 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedProduct(product)}
                    icon={Eye}
                    className="w-full"
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No products found matching your criteria.</p>
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
          />
        )}
      </div>
    </div>
  );
}

function ProductDetailModal({ 
  product, 
  onClose, 
  onApprove, 
  onReject,
  getStatusIcon,
  getStatusColor
}: { 
  product: AdminProduct; 
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  getStatusIcon: (status: string) => JSX.Element | null;
  getStatusColor: (status: string) => string;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
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
                    className="w-full h-64 object-cover rounded-lg"
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
                  <label className="block text-sm font-medium text-slate-700">Product Name</label>
                  <p className="mt-1 text-sm text-slate-900">{product.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Brand</label>
                  <p className="mt-1 text-sm text-slate-900">
                    {product.brand && typeof product.brand === 'object' && 'name' in product.brand 
                      ? product.brand.name 
                      : 'Unknown Brand'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">SKU</label>
                  <p className="mt-1 text-sm text-slate-900">{product.sku || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <p className="mt-1 text-sm text-slate-900">{product.category || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Price</label>
                  <p className="mt-1 text-sm text-slate-900">${product.current_price.toFixed(2)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <div className="mt-1 flex items-center">
                    {getStatusIcon(product.status)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <p className="mt-1 text-sm text-slate-900">{product.description || 'No description available'}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {product.status === 'pending' ? (
              <>
                <Button
                  onClick={() => {
                    onApprove(product.id);
                    onClose();
                  }}
                  className="w-full sm:w-auto sm:ml-3 bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    onReject(product.id);
                    onClose();
                  }}
                  variant="outline"
                  className="mt-3 w-full sm:mt-0 sm:w-auto sm:ml-3 border-red-300 text-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
              </>
            ) : null}
            <Button
              onClick={onClose}
              variant="outline"
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
