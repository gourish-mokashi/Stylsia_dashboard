import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import { useAnalyticsData } from '../hooks/useAnalyticsData';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('7d');
  
  // Fetch real analytics data
  const { analytics, loading, error, filters, setFilters, refreshData } = useAnalyticsData({
    period: dateRange === '7d' ? 'day' : 
            dateRange === '30d' ? 'week' : 
            dateRange === '90d' ? 'month' : 'day',
    date_start: getDateRangeStart(dateRange),
    date_end: new Date().toISOString().split('T')[0],
  });

  // Helper function to get date range start
  function getDateRangeStart(range: string): string {
    const date = new Date();
    switch (range) {
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
      default:
        date.setDate(date.getDate() - 7);
    }
    return date.toISOString().split('T')[0];
  }

  // Update date range
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    setFilters({
      ...filters,
      period: range === '7d' ? 'day' : 
              range === '30d' ? 'week' : 
              range === '90d' ? 'month' : 'day',
      date_start: getDateRangeStart(range),
      date_end: new Date().toISOString().split('T')[0],
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <Header 
          title="Analytics" 
          subtitle="Track your product performance and customer engagement"
        />
        
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Header 
          title="Analytics" 
          subtitle="Track your product performance and customer engagement"
        />
        
        <div className="mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to Load Analytics
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

  // Check if we have data
  const hasData = analytics?.overview?.total_products > 0;
  const trendsData = analytics?.trends || [];
  const topProducts = analytics?.top_products || [];

  return (
    <div className="p-6">
      <Header 
        title="Analytics" 
        subtitle="Track your product performance and customer engagement"
      />
      
      <div className="mt-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <select 
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
              <Button variant="outline" icon={Calendar} disabled={!hasData}>Custom Date</Button>
            </div>
            
            <Button icon={Download} disabled={!hasData}>Export Data</Button>
          </div>
        </div>

        {/* Empty State - Show when no data */}
        {!hasData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Analytics Data Available
            </h3>
            <p className="text-gray-600 mb-4">
              Analytics will appear here once you have products and they start receiving views and clicks.
            </p>
            <div className="text-sm text-gray-500">
              <p>To get started:</p>
              <ul className="mt-2 space-y-1">
                <li>• Add products to your catalog</li>
                <li>• Wait for product approval</li>
                <li>• Analytics will populate as users interact with your products</li>
              </ul>
            </div>
          </div>
        )}

        {/* Charts Row - Only show if there's data */}
        {hasData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clicks Over Time */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clicks Over Time</h3>
              {trendsData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="clicks" stroke="#0d9488" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No click data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Views Over Time */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
              {trendsData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No view data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Products Table - Only show if there's data */}
        {hasData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Performance</h3>
            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Product Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Views</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Clicks</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Conversions</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr key={product.product_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{product.product_name}</td>
                        <td className="py-3 px-4 text-gray-600">{product.views}</td>
                        <td className="py-3 px-4 text-gray-600">{product.clicks}</td>
                        <td className="py-3 px-4 text-gray-600">{product.conversions}</td>
                        <td className="py-3 px-4 text-gray-600">${product.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No product performance data available</p>
                <p className="text-sm mt-1">Data will appear once your products receive interactions</p>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats - Show current state */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.overview?.total_products || 0}
              </div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.overview?.total_views || 0}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.overview?.total_clicks || 0}
              </div>
              <div className="text-sm text-gray-600">Total Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.overview?.total_conversions || 0}
              </div>
              <div className="text-sm text-gray-600">Conversions</div>
            </div>
          </div>
          
          {!hasData && (
            <div className="mt-4 text-center text-sm text-gray-500">
              All metrics will update automatically as your products gain traction on the platform.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}