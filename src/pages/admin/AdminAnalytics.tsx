import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("30d");
  const { data: analytics, loading, error, refreshData } = useAdminAnalytics();

  const handleExport = () => {
    if (!analytics) return;

    // Create CSV data with actual values only
    const csvData = [
      ["Metric", "Value"],
      ["Total Brands", analytics.overview.totalBrands.toString()],
      ["Active Brands", analytics.statusDistribution.activeBrands.toString()],
      ["Paused Brands", analytics.statusDistribution.pausedBrands.toString()],
      [
        "Suspended Brands",
        analytics.statusDistribution.suspendedBrands.toString(),
      ],
      ["Total Products", analytics.overview.totalProducts.toString()],
      [
        "Active Products",
        analytics.statusDistribution.activeProducts.toString(),
      ],
      [
        "Pending Products",
        analytics.statusDistribution.pendingProducts.toString(),
      ],
      ["Total Revenue", `$${analytics.overview.totalRevenue}`],
      ["Conversion Rate", `${analytics.overview.conversionRate}%`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "admin-analytics.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600">Loading analytics data...</p>
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
            <h1 className="text-2xl font-bold text-slate-900">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600">Platform performance and insights</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Failed to Load Data
            </h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button
              onClick={refreshData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-slate-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600">No data available</p>
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
            <h1 className="text-2xl font-bold text-slate-900">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600">Platform performance and insights</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button onClick={refreshData} variant="outline" className="text-sm">
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              icon={Download}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              Export
            </Button>
          </div>
        </div>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Brands</p>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics.overview.totalBrands.toLocaleString()}
                </p>
                <p
                  className={`text-xs ${
                    analytics.overview.brandGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {analytics.overview.brandGrowth >= 0 ? "+" : ""}
                  {analytics.overview.brandGrowth.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Products</p>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics.overview.totalProducts.toLocaleString()}
                </p>
                <p
                  className={`text-xs ${
                    analytics.overview.productGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {analytics.overview.productGrowth >= 0 ? "+" : ""}
                  {analytics.overview.productGrowth.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${analytics.overview.totalRevenue.toLocaleString()}
                </p>
                <p
                  className={`text-xs ${
                    analytics.overview.revenueGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {analytics.overview.revenueGrowth >= 0 ? "+" : ""}
                  {analytics.overview.revenueGrowth.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics.overview.conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
                  {analytics.statusDistribution.activeProducts} active
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Chart */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Growth Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.brandGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="brands"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Brands"
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="products"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Products"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Status Overview
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Brands
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Active</span>
                    <span className="font-medium text-green-600">
                      {analytics.statusDistribution.activeBrands}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Paused</span>
                    <span className="font-medium text-amber-600">
                      {analytics.statusDistribution.pausedBrands}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Suspended</span>
                    <span className="font-medium text-red-600">
                      {analytics.statusDistribution.suspendedBrands}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Products
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Active</span>
                    <span className="font-medium text-green-600">
                      {analytics.statusDistribution.activeProducts}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-medium text-amber-600">
                      {analytics.statusDistribution.pendingProducts}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Inactive</span>
                    <span className="font-medium text-slate-500">
                      {analytics.statusDistribution.inactiveProducts}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Product Categories
            </h3>
            {analytics.categoryDistribution.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {analytics.categoryDistribution.map((_, index) => {
                        const colors = [
                          "#3b82f6",
                          "#10b981",
                          "#f59e0b",
                          "#ef4444",
                          "#8b5cf6",
                          "#06b6d4",
                        ];
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500">
                <p>No category data</p>
              </div>
            )}
          </div>

          {/* Top Brands */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Top Performing Brands
            </h3>
            {analytics.topBrands.length > 0 ? (
              <div className="space-y-3">
                {analytics.topBrands.slice(0, 5).map((brand, index) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {brand.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {brand.productCount} products
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        ${brand.revenue.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          brand.status === "active"
                            ? "bg-green-100 text-green-700"
                            : brand.status === "paused"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {brand.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                <p>No brand data</p>
              </div>
            )}
          </div>
        </div>
        {/* Recent Activity */}
        {analytics.recentActivity.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {analytics.recentActivity.slice(0, 8).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 border-l-2 border-l-slate-200 bg-slate-50 rounded-r-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "brand_joined"
                        ? "bg-blue-500"
                        : activity.type === "product_added"
                        ? "bg-green-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      {activity.type === "brand_joined" && (
                        <>
                          Brand{" "}
                          <span className="font-medium">
                            {activity.brandName}
                          </span>{" "}
                          joined
                        </>
                      )}
                      {activity.type === "product_added" &&
                        activity.productName && (
                          <>
                            Product{" "}
                            <span className="font-medium">
                              {activity.productName}
                            </span>{" "}
                            added by{" "}
                            <span className="font-medium">
                              {activity.brandName}
                            </span>
                          </>
                        )}
                      {activity.type === "product_approved" &&
                        activity.productName && (
                          <>
                            Product{" "}
                            <span className="font-medium">
                              {activity.productName}
                            </span>{" "}
                            approved
                          </>
                        )}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
