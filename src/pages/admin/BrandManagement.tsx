import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, Pause, Play, Trash2, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle, Info, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

interface Brand {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'paused' | 'suspended';
  joinDate: string;
  productCount: number;
  lastActivity: string | null;
  role: string;
  contactPerson?: string;
  phone?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  description?: string;
  isVisible: boolean; // Controls product visibility on website
}

interface BrandManagementState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  totalBrands: number;
}

export default function BrandManagement() {
  const [state, setState] = useState<BrandManagementState>({
    brands: [],
    loading: true,
    error: null,
    searchTerm: '',
    statusFilter: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    currentPage: 1,
    itemsPerPage: 10,
    totalBrands: 0,
  });

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    type: 'pause' | 'remove' | 'activate';
    brand: Brand | null;
  }>({ show: false, type: 'pause', brand: null });

  const fetchBrands = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get all support requests with their basic info to simulate brand data
      const { data: supportRequestsData, error: supportRequestsError } = await supabase
        .from('support_requests')
        .select(`
          brand_id,
          id,
          created_at
        `)
        .not('brand_id', 'is', null);

      if (supportRequestsError) throw supportRequestsError;

      // Group by brand_id and calculate stats
      const brandStats = new Map<string, {
        productCount: number;
        lastActivity: string | null;
        joinDate: string;
      }>();

      supportRequestsData?.forEach(request => {
        if (!request.brand_id) return;

        const existing = brandStats.get(request.brand_id) || {
          productCount: 0,
          lastActivity: null,
          joinDate: request.created_at,
        };

        existing.productCount += 1;
        
        // Update last activity if this request is more recent
        if (!existing.lastActivity || 
            new Date(request.created_at) > new Date(existing.lastActivity)) {
          existing.lastActivity = request.created_at;
        }

        // Update join date if this request is older
        if (new Date(request.created_at) < new Date(existing.joinDate)) {
          existing.joinDate = request.created_at;
        }

        brandStats.set(request.brand_id, existing);
      });

      // Convert to brands array with enhanced mock data
      const brands: Brand[] = Array.from(brandStats.entries()).map(([brandId, stats]) => {
        const brandName = `Brand ${brandId.slice(0, 8)}`;
        const brandEmail = brandId === 'demo-brand-id' ? 'demo@stylsia.com' : `brand-${brandId.slice(0, 8)}@example.com`;
        
        return {
          id: brandId,
          email: brandEmail,
          name: brandName,
          status: Math.random() > 0.8 ? 'paused' : 'active',
          joinDate: stats.joinDate,
          productCount: stats.productCount,
          lastActivity: stats.lastActivity,
          role: 'brand',
          contactPerson: `Contact Person ${brandId.slice(0, 4)}`,
          phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          website: `https://${brandName.toLowerCase().replace(' ', '')}.com`,
          industry: ['Fashion', 'Accessories', 'Footwear', 'Jewelry'][Math.floor(Math.random() * 4)],
          companySize: ['1-10', '11-50', '51-200', '200+'][Math.floor(Math.random() * 4)],
          description: `${brandName} is a modern fashion brand focused on quality and style.`,
          isVisible: Math.random() > 0.2, // 80% visible by default
        };
      });

      // Add demo brand if no data exists
      if (brands.length === 0) {
        brands.push({
          id: 'demo-brand-id',
          email: 'demo@stylsia.com',
          name: 'Demo Fashion Brand',
          status: 'active',
          joinDate: new Date().toISOString(),
          productCount: 12,
          lastActivity: new Date().toISOString(),
          role: 'brand',
          contactPerson: 'John Demo',
          phone: '+1 (555) 123-4567',
          website: 'https://demofashion.com',
          industry: 'Fashion',
          companySize: '11-50',
          description: 'Demo Fashion Brand is a contemporary fashion company.',
          isVisible: true,
        });
      }

      setState(prev => ({
        ...prev,
        brands,
        totalBrands: brands.length,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching brands:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch brands',
      }));
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const filteredBrands = state.brands
    .filter(brand => {
      const matchesSearch = brand.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           brand.email.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesStatus = state.statusFilter === 'all' || brand.status === state.statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[state.sortBy as keyof Brand];
      const bValue = b[state.sortBy as keyof Brand];
      
      if (state.sortOrder === 'asc') {
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
    setState(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleToggleVisibility = (brand: Brand) => {
    setShowConfirmDialog({
      show: true,
      type: brand.isVisible ? 'pause' : 'activate',
      brand,
    });
  };

  const handleRemoveBrand = (brand: Brand) => {
    setShowConfirmDialog({
      show: true,
      type: 'remove',
      brand,
    });
  };

  const confirmAction = async () => {
    if (!showConfirmDialog.brand) return;

    const { brand, type } = showConfirmDialog;

    try {
      if (type === 'remove') {
        // Remove brand from list
        setState(prev => ({
          ...prev,
          brands: prev.brands.filter(b => b.id !== brand.id),
          totalBrands: prev.totalBrands - 1,
        }));
      } else {
        // Toggle visibility
        setState(prev => ({
          ...prev,
          brands: prev.brands.map(b => 
            b.id === brand.id 
              ? { ...b, isVisible: type === 'activate', status: type === 'activate' ? 'active' : 'paused' }
              : b
          ),
        }));
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }

    setShowConfirmDialog({ show: false, type: 'pause', brand: null });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-amber-500" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-amber-100 text-amber-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Loading state
  if (state.loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Brand Management
            </h1>
            <p className="text-gray-600 mt-1">Loading brand data...</p>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Total Brands: ...</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Brand Management
            </h1>
            <p className="text-gray-600 mt-1">Error loading brand data</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Failed to Load Brands
          </h3>
          <p className="text-red-700 mb-4">{state.error}</p>
          <Button onClick={fetchBrands} icon={RefreshCw}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Total Brand Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Brand Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all brands on the platform
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-bold text-blue-900">
              Total Brands: {state.totalBrands}
            </span>
          </div>
          <Button onClick={fetchBrands} icon={RefreshCw} loading={state.loading} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search brands by name or email..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-3">
            <select
              value={state.statusFilter}
              onChange={(e) => setState(prev => ({ ...prev, statusFilter: e.target.value, currentPage: 1 }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <Button variant="outline" icon={Filter}>
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Brand Overview Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredBrands.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {state.searchTerm ? 'No brands found' : 'No brands registered'}
            </h3>
            <p className="text-gray-600">
              {state.searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Brands will appear here once they register on the platform.'
              }
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
                    onToggleVisibility={() => handleToggleVisibility(brand)}
                    onRemove={() => handleRemoveBrand(brand)}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Brand Name</span>
                        {state.sortBy === 'name' && (
                          <span className="text-blue-500">
                            {state.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('productCount')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Product Count</span>
                        {state.sortBy === 'productCount' && (
                          <span className="text-blue-500">
                            {state.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      onToggleVisibility={() => handleToggleVisibility(brand)}
                      onRemove={() => handleRemoveBrand(brand)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Showing {((state.currentPage - 1) * state.itemsPerPage) + 1} to{' '}
                    {Math.min(state.currentPage * state.itemsPerPage, filteredBrands.length)} of{' '}
                    {filteredBrands.length} brands
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={state.currentPage === 1}
                      onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {state.currentPage} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={state.currentPage === totalPages}
                      onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
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
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog.show && showConfirmDialog.brand && (
        <ConfirmationDialog
          type={showConfirmDialog.type}
          brand={showConfirmDialog.brand}
          onConfirm={confirmAction}
          onCancel={() => setShowConfirmDialog({ show: false, type: 'pause', brand: null })}
        />
      )}
    </div>
  );
}

// Brand Mobile Card Component
function BrandMobileCard({ 
  brand, 
  onInfo, 
  onToggleVisibility, 
  onRemove 
}: {
  brand: Brand;
  onInfo: () => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="p-4 relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-medium text-gray-900">{brand.name}</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(brand.status)}`}>
              {brand.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{brand.email}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">{brand.productCount}</span> products
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${brand.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {brand.isVisible ? 'Visible' : 'Hidden'}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
              <button
                onClick={() => { onInfo(); setShowActions(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
              >
                <Info className="h-3 w-3 mr-2" />
                Info
              </button>
              <button
                onClick={() => { onToggleVisibility(); setShowActions(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
              >
                {brand.isVisible ? <Pause className="h-3 w-3 mr-2" /> : <Play className="h-3 w-3 mr-2" />}
                {brand.isVisible ? 'Pause' : 'Activate'}
              </button>
              <button
                onClick={() => { onRemove(); setShowActions(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Remove
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
  onToggleVisibility, 
  onRemove 
}: {
  brand: Brand;
  onInfo: () => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
}) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{brand.name}</div>
          <div className="text-sm text-gray-500">{brand.email}</div>
          <div className="flex items-center mt-1 space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${brand.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {brand.isVisible ? 'Visible on Website' : 'Hidden from Website'}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">{brand.productCount}</div>
        <div className="text-sm text-gray-500">products</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(brand.status)}
          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(brand.status)}`}>
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
            onClick={onToggleVisibility}
            icon={brand.isVisible ? Pause : Play}
            className={brand.isVisible ? "text-amber-600 hover:text-amber-700" : "text-green-600 hover:text-green-700"}
          >
            {brand.isVisible ? 'Pause' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRemove}
            icon={Trash2}
            className="text-red-600 hover:text-red-700"
          >
            Remove
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Brand Detail Modal Component
function BrandDetailModal({
  brand,
  onClose
}: {
  brand: Brand;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Brand Details
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(brand.status)}`}>
                  {brand.status}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${brand.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {brand.isVisible ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                <p className="mt-1 text-sm text-gray-900">{brand.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{brand.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                <p className="mt-1 text-sm text-gray-900">{brand.contactPerson || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{brand.phone || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <p className="mt-1 text-sm text-gray-900">{brand.website || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <p className="mt-1 text-sm text-gray-900">{brand.industry || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Size</label>
                <p className="mt-1 text-sm text-gray-900">{brand.companySize || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Count</label>
                <p className="mt-1 text-sm text-gray-900">{brand.productCount} products</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Onboarding Date</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(brand.joinDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Activity</label>
                <p className="mt-1 text-sm text-gray-900">
                  {brand.lastActivity ? formatTimeAgo(brand.lastActivity) : 'Never'}
                </p>
              </div>
            </div>
            
            {brand.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{brand.description}</p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
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
  onCancel
}: {
  type: 'pause' | 'remove' | 'activate';
  brand: Brand;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const getDialogContent = () => {
    switch (type) {
      case 'pause':
        return {
          title: 'Pause Brand Visibility',
          message: `Are you sure you want to hide ${brand.name}'s products from the website? This will make their products invisible to customers.`,
          confirmText: 'Pause',
          confirmClass: 'bg-amber-600 hover:bg-amber-700',
        };
      case 'activate':
        return {
          title: 'Activate Brand Visibility',
          message: `Are you sure you want to make ${brand.name}'s products visible on the website?`,
          confirmText: 'Activate',
          confirmClass: 'bg-green-600 hover:bg-green-700',
        };
      case 'remove':
        return {
          title: 'Remove Brand',
          message: `Are you sure you want to remove ${brand.name} from the partner list? This action cannot be undone and will permanently delete all their data.`,
          confirmText: 'Remove',
          confirmClass: 'bg-red-600 hover:bg-red-700',
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          confirmClass: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const content = getDialogContent();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {content.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {content.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${content.confirmClass}`}
              onClick={onConfirm}
            >
              {content.confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

// Helper functions
function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'paused':
      return <Pause className="h-4 w-4 text-amber-500" />;
    case 'suspended':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'paused':
      return 'bg-amber-100 text-amber-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatTimeAgo(dateString: string | null) {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}