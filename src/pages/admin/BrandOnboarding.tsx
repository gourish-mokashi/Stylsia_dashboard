import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Mail, 
  Globe, 
  Building, 
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  Package
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

interface Brand {
  id: string;
  name: string;
  email: string;
  website?: string;
  status: 'applied' | 'reviewing' | 'approved' | 'rejected';
  appliedDate: string;
  description: string;
  contactPerson?: string;
  phone?: string;
  industry?: string;
  companySize?: string;
  lastActivity?: string;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface OnboardingStats {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  thisWeekApplications: number;
  averageReviewTime: number;
}

export default function BrandOnboarding() {
  // State Management
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // UI State
  const [showNewBrandForm, setShowNewBrandForm] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>>([]);

  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      id: 'applied',
      title: 'Applied',
      color: 'bg-blue-100',
      textColor: 'text-blue-800',
      count: brands.filter(b => b.status === 'applied').length,
    },
    {
      id: 'reviewing',
      title: 'Under Review',
      color: 'bg-amber-100',
      textColor: 'text-amber-800',
      count: brands.filter(b => b.status === 'reviewing').length,
    },
    {
      id: 'approved',
      title: 'Approved',
      color: 'bg-green-100',
      textColor: 'text-green-800',
      count: brands.filter(b => b.status === 'approved').length,
    },
    {
      id: 'rejected',
      title: 'Rejected',
      color: 'bg-red-100',
      textColor: 'text-red-800',
      count: brands.filter(b => b.status === 'rejected').length,
    },
  ];

  // Database Operations
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate fetching from support_requests table for brand applications
      const { data: supportRequests, error: requestsError } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Transform support requests into brand applications
      const mockBrands: Brand[] = (supportRequests || []).map((request, index) => ({
        id: request.id,
        name: `Brand ${request.id.slice(0, 8)}`,
        email: `brand-${request.id.slice(0, 8)}@example.com`,
        website: `https://brand-${request.id.slice(0, 8)}.com`,
        status: ['applied', 'reviewing', 'approved', 'rejected'][index % 4] as Brand['status'],
        appliedDate: request.created_at,
        description: request.description || 'Fashion brand application',
        contactPerson: `Contact Person ${index + 1}`,
        phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        industry: ['Fashion', 'Accessories', 'Footwear', 'Jewelry'][index % 4],
        companySize: ['1-10', '11-50', '51-200', '200+'][index % 4],
        lastActivity: request.updated_at,
      }));

      setBrands(mockBrands);
      
      // Calculate stats
      const statsData: OnboardingStats = {
        totalApplications: mockBrands.length,
        pendingReview: mockBrands.filter(b => b.status === 'reviewing').length,
        approved: mockBrands.filter(b => b.status === 'approved').length,
        rejected: mockBrands.filter(b => b.status === 'rejected').length,
        thisWeekApplications: mockBrands.filter(b => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(b.appliedDate) > weekAgo;
        }).length,
        averageReviewTime: 2.5 // days
      };
      
      setStats(statsData);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch brand data');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBrandStatus = async (brandId: string, newStatus: Brand['status'], notes?: string) => {
    const actionId = `update-${brandId}`;
    setLoadingActions(prev => new Set(prev).add(actionId));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBrands(prev => prev.map(brand => 
        brand.id === brandId 
          ? { 
              ...brand, 
              status: newStatus, 
              reviewedAt: new Date().toISOString(),
              notes: notes || brand.notes 
            }
          : brand
      ));
      
      showNotification('success', `Brand status updated to ${newStatus}`);
      
    } catch (err) {
      showNotification('error', 'Failed to update brand status');
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  };

  const deleteBrand = async (brandId: string) => {
    if (!window.confirm('Are you sure you want to delete this brand application?')) {
      return;
    }
    
    const actionId = `delete-${brandId}`;
    setLoadingActions(prev => new Set(prev).add(actionId));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBrands(prev => prev.filter(brand => brand.id !== brandId));
      showNotification('success', 'Brand application deleted');
      
    } catch (err) {
      showNotification('error', 'Failed to delete brand application');
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  };

  // Utility Functions
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const getBrandsByStatus = (status: string) => {
    return brands.filter(brand => brand.status === status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'reviewing':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Effects
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchBrands, 30000);
    return () => clearInterval(interval);
  }, [fetchBrands]);

  // Loading State
  if (loading && brands.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Brand Onboarding
            </h1>
            <p className="text-slate-600 mt-1">Loading onboarding data...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse">
              <div className="w-16 h-4 bg-slate-200 rounded mb-4"></div>
              <div className="w-8 h-8 bg-slate-200 rounded mb-2"></div>
              <div className="w-12 h-4 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error && brands.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Brand Onboarding
            </h1>
            <p className="text-slate-600 mt-1">Error loading onboarding data</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Failed to Load Onboarding Data
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={fetchBrands} icon={RefreshCw}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg border animate-slide-up ${
              notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
              {notification.type === 'error' && <AlertCircle className="h-4 w-4" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Brand Onboarding
          </h1>
          <p className="text-slate-600 mt-1">
            Manage brand applications and onboarding process
          </p>
          {lastUpdated && (
            <p className="text-sm text-slate-500 mt-1">
              Last updated: {formatTimeAgo(lastUpdated.toISOString())}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBrands}
            icon={RefreshCw}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            icon={Plus}
            onClick={() => setShowNewBrandForm(true)}
          >
            Add New Brand
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Applications</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalApplications}</p>
                <p className="text-xs text-slate-500">+{stats.thisWeekApplications} this week</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingReview}</p>
                <p className="text-xs text-slate-500">Avg. {stats.averageReviewTime} days</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
                <p className="text-xs text-green-600">
                  {stats.totalApplications > 0 ? Math.round((stats.approved / stats.totalApplications) * 100) : 0}% approval rate
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Rejected</p>
                <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
                <p className="text-xs text-red-600">
                  {stats.totalApplications > 0 ? Math.round((stats.rejected / stats.totalApplications) * 100) : 0}% rejection rate
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kanbanColumns.map((column) => (
          <div key={column.id} className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className={`p-4 rounded-t-lg ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${column.textColor}`}>{column.title}</h3>
                <span className="bg-white text-slate-600 px-2 py-1 rounded-full text-xs font-medium">
                  {column.count}
                </span>
              </div>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {getBrandsByStatus(column.id).map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  onStatusUpdate={updateBrandStatus}
                  onDelete={deleteBrand}
                  onView={setSelectedBrand}
                  loading={loadingActions.has(`update-${brand.id}`) || loadingActions.has(`delete-${brand.id}`)}
                />
              ))}
              
              {getBrandsByStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Building className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm">No brands in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Brand Form Modal */}
      {showNewBrandForm && (
        <NewBrandModal 
          onClose={() => setShowNewBrandForm(false)}
          onSubmit={(brandData) => {
            // Handle new brand submission
            console.log('New brand data:', brandData);
            setShowNewBrandForm(false);
            showNotification('success', 'Brand application submitted successfully');
            fetchBrands(); // Refresh data
          }}
        />
      )}

      {/* Brand Detail Modal */}
      {selectedBrand && (
        <BrandDetailModal
          brand={selectedBrand}
          onClose={() => setSelectedBrand(null)}
          onStatusUpdate={updateBrandStatus}
        />
      )}
    </div>
  );
}

// Brand Card Component
function BrandCard({ 
  brand, 
  onStatusUpdate, 
  onDelete, 
  onView, 
  loading 
}: {
  brand: Brand;
  onStatusUpdate: (id: string, status: Brand['status'], notes?: string) => void;
  onDelete: (id: string) => void;
  onView: (brand: Brand) => void;
  loading: boolean;
}) {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'text-blue-600';
      case 'reviewing':
        return 'text-amber-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer relative">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-slate-900 text-sm truncate pr-2">
          {brand.name}
        </h4>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 hover:bg-slate-200 rounded"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4 text-slate-400" />
            )}
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-6 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-32">
              <button
                onClick={() => {
                  onView(brand);
                  setShowActions(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center"
              >
                <Eye className="h-3 w-3 mr-2" />
                View
              </button>
              <button
                onClick={() => {
                  onStatusUpdate(brand.id, 'approved');
                  setShowActions(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center text-green-600"
                disabled={brand.status === 'approved'}
              >
                <CheckCircle className="h-3 w-3 mr-2" />
                Approve
              </button>
              <button
                onClick={() => {
                  onStatusUpdate(brand.id, 'rejected');
                  setShowActions(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center text-red-600"
                disabled={brand.status === 'rejected'}
              >
                <AlertCircle className="h-3 w-3 mr-2" />
                Reject
              </button>
              <button
                onClick={() => {
                  onDelete(brand.id);
                  setShowActions(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-1 text-xs text-slate-600">
        <div className="flex items-center">
          <Mail className="h-3 w-3 mr-1" />
          <span className="truncate">{brand.email}</span>
        </div>
        {brand.website && (
          <div className="flex items-center">
            <Globe className="h-3 w-3 mr-1" />
            <span className="truncate">{brand.website}</span>
          </div>
        )}
        {brand.industry && (
          <div className="flex items-center">
            <Building className="h-3 w-3 mr-1" />
            <span className="truncate">{brand.industry}</span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
        {brand.description}
      </p>
      
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Applied: {new Date(brand.appliedDate).toLocaleDateString()}
        </span>
        <span className={`text-xs font-medium ${getStatusColor(brand.status)}`}>
          {brand.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}

// New Brand Modal Component
function NewBrandModal({
  onClose,
  onSubmit
}: {
  onClose: () => void;
  onSubmit: (brandData: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    description: '',
    contactPerson: '',
    phone: '',
    industry: '',
    companySize: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">
                Add New Brand Application
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Industry</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Jewelry">Jewelry</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button 
                type="submit" 
                loading={loading}
                className="w-full sm:w-auto sm:ml-3"
              >
                Add Brand
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Brand Detail Modal Component
function BrandDetailModal({
  brand,
  onClose,
  onStatusUpdate
}: {
  brand: Brand;
  onClose: () => void;
  onStatusUpdate: (id: string, status: Brand['status'], notes?: string) => void;
}) {
  const [notes, setNotes] = useState(brand.notes || '');
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: Brand['status']) => {
    setLoading(true);
    try {
      await onStatusUpdate(brand.id, newStatus, notes);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">
              Brand Application Details
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Brand Name</label>
                  <p className="mt-1 text-sm text-slate-900">{brand.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <p className="mt-1 text-sm text-slate-900">{brand.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Website</label>
                  <p className="mt-1 text-sm text-slate-900">{brand.website || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Industry</label>
                  <p className="mt-1 text-sm text-slate-900">{brand.industry || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Contact Person</label>
                  <p className="mt-1 text-sm text-slate-900">{brand.contactPerson || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Applied Date</label>
                  <p className="mt-1 text-sm text-slate-900">{new Date(brand.appliedDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <p className="mt-1 text-sm text-slate-900">{brand.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Review Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Add review notes..."
                />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <div className="flex space-x-2">
              <Button
                onClick={() => handleStatusUpdate('approved')}
                loading={loading}
                disabled={brand.status === 'approved'}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleStatusUpdate('rejected')}
                loading={loading}
                disabled={brand.status === 'rejected'}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full sm:mt-0 sm:w-auto sm:mr-3"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
