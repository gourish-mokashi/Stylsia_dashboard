import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Shield, 
  UserPlus,
  FileText,
  BarChart3,
  Settings,
  Search,
  Filter
} from 'lucide-react';
import StatsCard from '../../components/ui/StatsCard';
import Button from '../../components/ui/Button';
import SessionWarningModal from '../../components/admin/SessionWarningModal';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useSessionManager } from '../../hooks/useSessionManager';
import { useAdminData } from '../../hooks/useAdminData';
import { supabase } from '../../lib/supabase';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: 'user' | 'content' | 'analytics' | 'system';
  priority: 'high' | 'medium' | 'low';
}

export default function AdminDashboard() {
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    id: string;
  }[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalBrands: 0,
    activeBrands: 0,
    totalProducts: 0,
    pendingProducts: 0,
    supportRequests: 0,
    newSupportRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  const { refreshSession, signOut, sessionExpiry, user } = useAdminAuth();
  const { stats, loading: statsLoading, error, lastUpdated, refreshData } = useAdminData();

  // Fetch system stats
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        // Get brand stats
        const { data: brands, error: brandsError } = await supabase
          .from('brands')
          .select('id, status', { count: 'exact' });
        
        if (brandsError) throw brandsError;
        
        const activeBrands = brands?.filter(b => b.status === 'active').length || 0;
        
        // Get product stats
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, status', { count: 'exact' });
        
        if (productsError) throw productsError;
        
        const pendingProducts = products?.filter(p => p.status === 'pending').length || 0;
        
        // Get support request stats
        const { data: supportRequests, error: supportError } = await supabase
          .from('support_requests')
          .select('id, status', { count: 'exact' });
        
        if (supportError) throw supportError;
        
        const newSupportRequests = supportRequests?.filter(s => s.status === 'new').length || 0;
        
        setSystemStats({
          totalBrands: brands?.length || 0,
          activeBrands,
          totalProducts: products?.length || 0,
          pendingProducts,
          supportRequests: supportRequests?.length || 0,
          newSupportRequests,
        });
      } catch (error) {
        console.error('Error fetching system stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSystemStats();
  }, []);

  // Set up session management
  useSessionManager({
    warningThreshold: 5,
    onSessionWarning: () => {
      if (sessionExpiry) {
        const timeLeft = sessionExpiry.getTime() - new Date().getTime();
        setSessionTimeLeft(timeLeft);
        setShowSessionWarning(true);
      }
    },
    onSessionExpired: () => {
      setShowSessionWarning(false);
      signOut();
    },
    autoRefresh: false
  });

  // Quick Actions Configuration
  const quickActions: QuickAction[] = [
    {
      id: 'add-user',
      title: 'Add New Brand',
      description: 'Onboard a new brand partner to the platform',
      icon: UserPlus,
      category: 'user',
      priority: 'high',
      action: () => handleAction('add-user', () => {
        window.location.href = '/admin/onboarding';
      })
    },
    {
      id: 'view-brands',
      title: 'Manage Brands',
      description: 'View and manage all registered brands',
      icon: Users,
      category: 'user',
      priority: 'high',
      action: () => handleAction('view-brands', () => {
        window.location.href = '/admin/brands';
      })
    },
    {
      id: 'support-requests',
      title: 'Support Requests',
      description: 'View and respond to brand support tickets',
      icon: MessageSquare,
      category: 'content',
      priority: 'high',
      action: () => handleAction('support-requests', () => {
        window.location.href = '/admin/support';
      })
    },
    {
      id: 'product-management',
      title: 'Product Management',
      description: 'Review and approve product submissions',
      icon: Package,
      category: 'content',
      priority: 'high',
      action: () => handleAction('product-management', () => {
        window.location.href = '/admin/products';
      })
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Access detailed platform analytics and insights',
      icon: TrendingUp,
      category: 'analytics',
      priority: 'medium',
      action: () => handleAction('view-analytics', () => {
        window.location.href = '/admin/analytics';
      })
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure platform settings and preferences',
      icon: Settings,
      category: 'system',
      priority: 'medium',
      action: () => handleAction('system-settings', () => {
        window.location.href = '/admin/settings';
      })
    }
  ];

  const categories = [
    { id: 'all', name: 'All Actions', icon: Filter },
    { id: 'user', name: 'User Management', icon: Users },
    { id: 'content', name: 'Content Management', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'system', name: 'System', icon: Settings }
  ];

  const handleAction = async (actionId: string, actionFn: () => void | Promise<void>) => {
    await executeAction(actionId, actionFn);
  };

  const executeAction = async (actionId: string, actionFn: () => void | Promise<void>) => {
    setLoadingActions(prev => new Set(prev).add(actionId));
    
    try {
      await actionFn();
    } catch (error) {
      showNotification('error', 'Action failed. Please try again.');
      console.error('Action failed:', error);
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { type, message, id }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const filteredActions = quickActions.filter(action => {
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    const matchesSearch = action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleExtendSession = async () => {
    const success = await refreshSession();
    if (success) {
      setShowSessionWarning(false);
    }
  };

  const handleSignOut = () => {
    setShowSessionWarning(false);
    signOut();
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

  // Loading state
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Loading dashboard data...
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
            <Shield className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              Administrator
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Error loading dashboard data
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
            <Shield className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              Administrator
            </span>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Failed to Load Dashboard Data
          </h3>
          <p className="text-red-700 mb-4">
            {error}
          </p>
          <Button onClick={refreshData} icon={RefreshCw}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const kpiData = [
    {
      title: 'Total Brands',
      value: systemStats.totalBrands.toString(),
      change: systemStats.totalBrands > 0 ? '+12%' : undefined,
      icon: Users,
      color: 'primary' as const,
    },
    {
      title: 'Support Requests',
      value: systemStats.supportRequests.toString(),
      change: systemStats.newSupportRequests > 0 ? `${systemStats.newSupportRequests} new` : undefined,
      icon: MessageSquare,
      color: 'blue' as const,
    },
    {
      title: 'Total Products',
      value: systemStats.totalProducts.toString(),
      change: systemStats.pendingProducts > 0 ? `${systemStats.pendingProducts} pending` : undefined,
      icon: Package,
      color: 'green' as const,
    },
    {
      title: 'Platform Health',
      value: 'Excellent',
      icon: CheckCircle,
      color: 'green' as const,
    },
  ];

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
              {notification.type === 'error' && <AlertTriangle className="h-4 w-4" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <span className="text-sm font-medium text-gray-500">Admin</span>
          </li>
          <li>
            <div className="flex items-center">
              <span className="text-gray-400">/</span>
              <span className="ml-1 text-sm font-medium text-gray-900 md:ml-2">Dashboard</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your platform today.
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {formatTimeAgo(lastUpdated.toISOString())}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            icon={RefreshCw}
            loading={statsLoading}
            aria-label="Refresh dashboard data"
          >
            Refresh
          </Button>
          
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
            <Shield className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Error banner for refresh errors */}
      {error && stats && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4" role="alert">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-amber-700 text-sm">
              Unable to refresh data: {error}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshData}
              className="ml-auto"
              aria-label="Retry data refresh"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiData.map((stat, index) => (
          <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Enhanced Quick Actions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Frequently used administrative functions and tools
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
                  aria-label="Search quick actions"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                aria-label="Filter actions by category"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${category.name}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Grid */}
        <div className="p-6">
          {filteredActions.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No actions found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                const isLoading = loadingActions.has(action.id);
                
                return (
                  <div
                    key={action.id}
                    className={`group relative p-6 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all duration-200 ${
                      action.priority === 'high' ? 'ring-1 ring-red-100' : ''
                    }`}
                  >
                    {/* Priority Indicator */}
                    {action.priority === 'high' && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full" 
                           aria-label="High priority action" />
                    )}
                    
                    <button
                      onClick={action.action}
                      disabled={isLoading}
                      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg"
                      aria-describedby={`${action.id}-description`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg transition-colors ${
                          action.priority === 'high' ? 'bg-red-100 text-red-600' :
                          action.priority === 'medium' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        } group-hover:scale-110 transition-transform`}>
                          {isLoading ? (
                            <RefreshCw className="h-6 w-6 animate-spin" />
                          ) : (
                            <Icon className="h-6 w-6" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors mb-2">
                            {action.title}
                          </h3>
                          <p 
                            id={`${action.id}-description`}
                            className="text-sm text-gray-600 leading-relaxed"
                          >
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Session Warning Modal */}
      <SessionWarningModal
        isOpen={showSessionWarning}
        onClose={() => setShowSessionWarning(false)}
        onExtend={handleExtendSession}
        onSignOut={handleSignOut}
        timeLeft={sessionTimeLeft}
      />
    </div>
  );
}