import {
  Users,
  Package,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Shield,
  FileText,
} from "lucide-react";
import StatsCard from "../../components/ui/StatsCard";
import Button from "../../components/ui/Button";
import { useAdminData } from "../../hooks/useAdminData";

export default function AdminDashboard() {
  const {
    stats,
    recentActivity,
    loading: statsLoading,
    error,
    lastUpdated,
    refreshData,
  } = useAdminData();

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

  // Loading state
  if (statsLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Loading dashboard data...</p>
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
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                <div className="w-16 h-4 bg-slate-200 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-slate-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-slate-200 rounded"></div>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Error loading dashboard data</p>
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
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={refreshData} icon={RefreshCw}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate platform health based on real metrics
  const calculatePlatformHealth = () => {
    if (!stats) return { status: "Loading...", color: "blue" as const };

    const totalIssues =
      (stats.pendingProducts || 0) + (stats.activeThreads || 0);
    const totalActivity = (stats.totalBrands || 0) + (stats.totalProducts || 0);

    if (totalActivity === 0)
      return { status: "No Data", color: "blue" as const };

    const healthRatio = 1 - totalIssues / Math.max(totalActivity, 1);

    if (healthRatio >= 0.9)
      return { status: "Excellent", color: "green" as const };
    if (healthRatio >= 0.7) return { status: "Good", color: "blue" as const };
    if (healthRatio >= 0.5) return { status: "Fair", color: "amber" as const };
    return { status: "Needs Attention", color: "red" as const };
  };

  const platformHealth = calculatePlatformHealth();

  // Calculate real conversion rate as a percentage
  const conversionRate =
    stats && stats.totalBrands > 0 && stats.totalProducts > 0
      ? Math.round((stats.totalProducts / stats.totalBrands) * 100) / 100
      : 0;

  const kpiData = [
    {
      title: "Total Brands",
      value: stats?.totalBrands?.toString() || "0",
      change:
        stats && stats.totalBrands > 5
          ? `${conversionRate}x avg products`
          : undefined,
      icon: Users,
      color: "primary" as const,
    },
    {
      title: "Active Support Requests",
      value: stats?.activeThreads?.toString() || "0",
      change:
        stats && stats.pendingProducts > 0
          ? `${stats.pendingProducts} pending`
          : "All resolved",
      icon: MessageSquare,
      color:
        stats && stats.activeThreads > 10
          ? ("red" as const)
          : ("blue" as const),
    },
    {
      title: "Total Products",
      value: stats?.totalProducts?.toString() || "0",
      change:
        stats && stats.pendingProducts > 0
          ? `${stats.pendingProducts} pending`
          : "All active",
      icon: Package,
      color: "green" as const,
    },
    {
      title: "Platform Health",
      value: platformHealth.status,
      change:
        stats && stats.totalBrands > 0
          ? `${stats.totalBrands} brands active`
          : undefined,
      icon: CheckCircle,
      color: platformHealth.color,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <span className="text-sm font-medium text-slate-500">Admin</span>
          </li>
          <li>
            <div className="flex items-center">
              <span className="text-slate-400">/</span>
              <span className="ml-1 text-sm font-medium text-slate-900 md:ml-2">
                Dashboard
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Welcome back! Here's what's happening with your platform today.
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
        <div
          className="bg-amber-50 border border-amber-200 rounded-lg p-4"
          role="alert"
        >
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

      {/* Recent Activities Section */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Activities
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Latest platform activities and system events
              </p>
            </div>
            <Button
              onClick={refreshData}
              icon={RefreshCw}
              variant="outline"
              size="sm"
              className="text-slate-600 hover:text-slate-900"
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-6">
          {statsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const getActivityIcon = () => {
                  switch (activity.type) {
                    case "brand_registered":
                      return <Users className="h-5 w-5 text-green-600" />;
                    case "product_submitted":
                      return <Package className="h-5 w-5 text-blue-600" />;
                    case "message_received":
                      return (
                        <MessageSquare className="h-5 w-5 text-amber-600" />
                      );
                    case "product_approved":
                      return <CheckCircle className="h-5 w-5 text-green-600" />;
                    case "product_rejected":
                      return <AlertTriangle className="h-5 w-5 text-red-600" />;
                    default:
                      return <FileText className="h-5 w-5 text-slate-600" />;
                  }
                };

                const getActivityColor = () => {
                  switch (activity.type) {
                    case "brand_registered":
                    case "product_approved":
                      return "bg-green-100";
                    case "product_submitted":
                      return "bg-blue-100";
                    case "message_received":
                      return "bg-amber-100";
                    case "product_rejected":
                      return "bg-red-100";
                    default:
                      return "bg-slate-100";
                  }
                };

                const formatTimeAgo = (timestamp: string) => {
                  const date = new Date(timestamp);
                  const now = new Date();
                  const diffInMinutes = Math.floor(
                    (now.getTime() - date.getTime()) / (1000 * 60)
                  );

                  if (diffInMinutes < 1) return "Just now";
                  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
                  if (diffInMinutes < 1440)
                    return `${Math.floor(diffInMinutes / 60)}h ago`;
                  return `${Math.floor(diffInMinutes / 1440)}d ago`;
                };

                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${getActivityColor()}`}>
                      {getActivityIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium">
                        {activity.message}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-slate-500">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                        {activity.user_email && (
                          <span className="text-xs text-slate-500">
                            • {activity.user_email}
                          </span>
                        )}
                        {activity.metadata?.priority && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.metadata.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : activity.metadata.priority === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {activity.metadata.priority} priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No recent activities
              </h3>
              <p className="text-slate-600">
                Recent platform activities will appear here once there's some
                activity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
