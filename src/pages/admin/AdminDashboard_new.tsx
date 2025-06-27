import { useState, useEffect } from "react";
import {
  Users,
  Package,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Shield,
  Settings,
  BarChart3,
  Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import StatsCard from "../../components/ui/StatsCard";
import Button from "../../components/ui/Button";
import SessionWarningModal from "../../components/admin/SessionWarningModal";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useSessionManager } from "../../hooks/useSessionManager";
import { useAdminData } from "../../hooks/useAdminData";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const [systemStats, setSystemStats] = useState({
    totalBrands: 0,
    activeBrands: 0,
    totalProducts: 0,
    pendingProducts: 0,
    supportRequests: 0,
    newSupportRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    manageBrands: false,
    manageProducts: false,
    viewAnalytics: false,
    manageSettings: false,
  });

  const { refreshSession, signOut, sessionExpiry } = useAdminAuth();
  const {
    stats,
    recentActivity,
    loading: statsLoading,
    error,
    refreshData,
  } = useAdminData();

  // Fetch system stats
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        // Get brand stats
        const { data: brands, error: brandsError } = await supabase
          .from("brands")
          .select("id, status", { count: "exact" });

        if (brandsError) throw brandsError;

        const activeBrands =
          brands?.filter((b) => b.status === "active").length || 0;

        // Get product stats
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id, status", { count: "exact" });

        if (productsError) throw productsError;

        const pendingProducts =
          products?.filter((p) => p.status === "pending").length || 0;

        // Get support request stats
        const { data: supportRequests, error: supportError } = await supabase
          .from("support_requests")
          .select("id, status", { count: "exact" });

        if (supportError) throw supportError;

        const newSupportRequests =
          supportRequests?.filter((s) => s.status === "new").length || 0;

        setSystemStats({
          totalBrands: brands?.length || 0,
          activeBrands,
          totalProducts: products?.length || 0,
          pendingProducts,
          supportRequests: supportRequests?.length || 0,
          newSupportRequests,
        });
      } catch (error) {
        console.error("Error fetching system stats:", error);
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
    autoRefresh: false,
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
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Quick Action Event Handlers
  const handleManageBrands = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, manageBrands: true }));
      navigate("/admin/brands");
    } catch (error) {
      console.error("Error navigating to brand management:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, manageBrands: false }));
    }
  };

  const handleManageProducts = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, manageProducts: true }));
      navigate("/admin/products");
    } catch (error) {
      console.error("Error navigating to product management:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, manageProducts: false }));
    }
  };

  const handleViewAnalytics = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, viewAnalytics: true }));
      navigate("/admin/analytics");
    } catch (error) {
      console.error("Error navigating to analytics:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, viewAnalytics: false }));
    }
  };

  const handleManageSettings = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, manageSettings: true }));
      navigate("/admin/settings");
    } catch (error) {
      console.error("Error navigating to settings:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, manageSettings: false }));
    }
  };

  // Generate stats using Stylsia theme colors
  const kpiData = [
    {
      title: "Total Brands",
      value: systemStats.totalBrands.toString(),
      change:
        systemStats.activeBrands > 0
          ? `${systemStats.activeBrands} active`
          : undefined,
      icon: Users,
      color: "blue" as const,
    },
    {
      title: "Total Products",
      value: systemStats.totalProducts.toString(),
      change:
        systemStats.pendingProducts > 0
          ? `${systemStats.pendingProducts} pending`
          : undefined,
      icon: Package,
      color: "green" as const,
    },
    {
      title: "Support Requests",
      value: systemStats.supportRequests.toString(),
      change:
        systemStats.newSupportRequests > 0
          ? `${systemStats.newSupportRequests} new`
          : undefined,
      icon: MessageSquare,
      color: "amber" as const,
    },
    {
      title: "Platform Health",
      value: "Excellent",
      icon: CheckCircle,
      color: "green" as const,
    },
  ];

  const isLoading = loading || statsLoading;
  const hasError = error && !stats;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-4 sm:py-6">
        <Header
          title="Admin Dashboard"
          subtitle="Manage your fashion marketplace platform and monitor system performance"
        />

        <div className="mt-6 space-y-6">
          {/* Admin Role Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 animate-fade-in">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Administrator Access
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              icon={RefreshCw}
              loading={statsLoading}
              aria-label="Refresh dashboard data"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
            >
              Refresh
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin dashboard data...</p>
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Failed to Load Dashboard Data
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button
                onClick={refreshData}
                icon={RefreshCw}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Stats Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              {kpiData.map((stat, index) => (
                <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                  <StatsCard {...stat} />
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 animate-slide-up">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Admin Quick Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  fullWidth
                  loading={loadingStates.manageBrands}
                  onClick={handleManageBrands}
                  icon={Store}
                  aria-label="Manage brands and brand registrations"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 focus:ring-blue-500 transition-all duration-200"
                >
                  Manage Brands
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  loading={loadingStates.manageProducts}
                  onClick={handleManageProducts}
                  icon={Package}
                  aria-label="Manage products and approvals"
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 focus:ring-green-500 transition-all duration-200"
                >
                  Manage Products
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  loading={loadingStates.viewAnalytics}
                  onClick={handleViewAnalytics}
                  icon={BarChart3}
                  aria-label="View platform analytics and insights"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 focus:ring-amber-500 transition-all duration-200"
                >
                  View Analytics
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  loading={loadingStates.manageSettings}
                  onClick={handleManageSettings}
                  icon={Settings}
                  aria-label="Configure platform settings"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-blue-500 transition-all duration-200"
                >
                  Platform Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Activities Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 animate-slide-up">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Recent Platform Activities
              </h2>

              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map(
                    (
                      activity: {
                        action: string;
                        table_name: string;
                        created_at: string;
                        details?: any;
                      },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action} on {activity.table_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTimeAgo(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Recent Activity
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Platform activity will appear here as brands register and
                    products are added to the marketplace.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Getting Started Section - Show when no data */}
          {!isLoading &&
            !hasError &&
            systemStats.totalBrands === 0 &&
            systemStats.totalProducts === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-slide-up">
                <div className="p-6 text-center">
                  <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Welcome to Stylsia Admin Dashboard
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Your admin dashboard is ready. Start by managing brand
                    registrations and product approvals to build your fashion
                    marketplace.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-blue-800">
                      <strong>Getting Started:</strong>
                      <br />
                      Review brand applications, approve products, and monitor
                      platform analytics from this dashboard.
                    </p>
                  </div>
                </div>
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
