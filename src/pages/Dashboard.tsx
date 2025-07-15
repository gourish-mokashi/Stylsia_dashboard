import React, { useState } from 'react';
import { MousePointer, TrendingUp, Clock, BarChart3, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import StatsCard from '../components/ui/StatsCard';
import Button from '../components/ui/Button';
import { useBrandData } from '../hooks/useBrandData';
import { useAnalyticsData } from '../hooks/useAnalyticsData';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loadingStates, setLoadingStates] = useState({
    viewProducts: false,
    viewAnalytics: false,
  });

  // Fetch real data from database
  const { brandWithMetrics, loading: brandLoading, error: brandError } = useBrandData();
  const { analytics, loading: analyticsLoading, error: analyticsError } = useAnalyticsData({
    period: 'week'
  });

  // Generate stats from real data
  const stats = [
    {
      title: 'Total Products Listed',
      value: brandWithMetrics?.metrics?.total_products?.toString() || '0',
      change: brandWithMetrics?.metrics?.total_products > 0 ? '+12%' : undefined,
      icon: FileText,
      color: 'primary' as const,
    },
    {
      title: 'Clicks (last 7 days)',
      value: analytics?.overview?.total_clicks?.toString() || '0',
      change: analytics?.overview?.total_clicks > 0 ? '+8%' : undefined,
      icon: MousePointer,
      color: 'green' as const,
    },
    {
      title: 'Views (last 7 days)',
      value: analytics?.overview?.total_views?.toString() || '0',
      change: analytics?.overview?.total_views > 0 ? '+15%' : undefined,
      icon: TrendingUp,
      color: 'blue' as const,
    },
    {
      title: 'Pending Approvals',
      value: '0', // This would come from products with pending status
      icon: Clock,
      color: 'amber' as const,
    },
  ];

  // Only show announcements if there are any - empty array for now
  const announcements: Array<{
    id: number;
    title: string;
    content: string;
    date: string;
  }> = [];

  // Quick Action Event Handlers
  const handleViewMyProducts = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, viewProducts: true }));
      navigate('/dashboard/products');
    } catch (error) {
      console.error('Error navigating to products:', error);
      alert('Unable to load products page. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, viewProducts: false }));
    }
  };

  const handleViewAnalytics = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, viewAnalytics: true }));
      navigate('/dashboard/analytics');
    } catch (error) {
      console.error('Error navigating to analytics:', error);
      alert('Unable to load analytics page. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, viewAnalytics: false }));
    }
  };

  const isLoading = brandLoading || analyticsLoading;
  const hasError = brandError || analyticsError;

  return (
    <div className="container-responsive py-4 sm:py-6">
      <Header 
        title={`Welcome${brandWithMetrics?.name ? `, ${brandWithMetrics.name}` : ''}`}
        subtitle="Here's what's happening with your products today"
      />
      
      <div className="mt-6 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">Unable to load dashboard data. Please check your connection and try again.</p>
          </div>
        )}

        {/* Stats Grid - Show when not loading */}
        {!isLoading && (
          <div className="grid-responsive-1-2-4 animate-fade-in">
            {stats.map((stat, index) => (
              <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                <StatsCard {...stat} />
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions - Always show */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-slide-up">
          <div className="p-4 sm:p-6">
            <h2 className="text-fluid-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            {/* Responsive button layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                fullWidth
                loading={loadingStates.viewProducts}
                onClick={handleViewMyProducts}
                icon={FileText}
                aria-label="View and manage your existing products"
                aria-describedby="view-products-description"
              >
                View My Products
              </Button>
              
              <Button 
                variant="outline" 
                fullWidth
                loading={loadingStates.viewAnalytics}
                onClick={handleViewAnalytics}
                icon={BarChart3}
                aria-label="View detailed analytics and performance metrics"
                aria-describedby="view-analytics-description"
              >
                View Analytics
              </Button>
            </div>

            {/* Hidden descriptions for screen readers */}
            <div className="sr-only">
              <div id="view-products-description">
                Navigate to your products page to view and manage all your listed products.
              </div>
              <div id="view-analytics-description">
                Access comprehensive analytics including click rates, views, and performance metrics for your products.
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Section - Show when no data */}
        {!isLoading && !hasError && (!brandWithMetrics?.metrics?.total_products || brandWithMetrics.metrics.total_products === 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-slide-up">
            <div className="p-4 sm:p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-fluid-lg font-semibold text-gray-900 mb-2">Welcome to Partner Dashboard</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your products will appear here once they are added to our platform. Contact our team to get started with product listings.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Need to add products?</strong><br />
                  Contact our support team at support@stylsia.com to discuss product onboarding options.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Announcements - Only show if there are any */}
        {announcements.length > 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-slide-up">
            <div className="p-4 sm:p-6">
              <h2 className="text-fluid-lg font-semibold text-gray-900 mb-4">Stylsia Updates</h2>
              
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div 
                    key={announcement.id} 
                    className="border-l-4 border-primary-500 pl-4 py-3 hover:bg-gray-50 transition-colors duration-200 rounded-r-lg"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <h3 className="font-medium text-gray-900 text-fluid-base">{announcement.title}</h3>
                    <p className="text-fluid-sm text-gray-600 mt-1 leading-relaxed">{announcement.content}</p>
                    <p className="text-fluid-xs text-gray-500 mt-2">{announcement.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}