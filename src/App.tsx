import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ConnectionError } from "./components/common/ConnectionError";
import LoginForm from "./components/auth/LoginForm";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import AdminLoginForm from "./components/admin/AdminLoginForm";

// Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Analytics from "./pages/Analytics";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import BrandManagement from "./pages/admin/BrandManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

const AppContent: React.FC = () => {
  const { user, loading, connectionError } = useAuth();

  if (connectionError) {
    return <ConnectionError onRetry={() => window.location.reload()} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/admin/login"
            element={
              <AdminAuthProvider>
                <AdminLoginForm />
              </AdminAuthProvider>
            }
          />
          <Route path="*" element={<LoginForm />} />
        </Routes>
      </div>
    );
  }

  // Check if user has admin role (check both role metadata and admin email whitelist)
  const adminEmails = [
    "admin@stylsia.com",
    "support@stylsia.com",
    "manager@stylsia.com",
  ];
  const isAdminByRole =
    user?.user_metadata?.role === "admin" ||
    user?.app_metadata?.role === "admin";
  const isAdminByEmail = adminEmails.includes(user?.email?.toLowerCase() || "");
  const isAdmin = isAdminByRole || isAdminByEmail;

  console.log("Is admin by role?", isAdminByRole);
  console.log("Is admin by email?", isAdminByEmail);
  console.log("Is admin (final)?", isAdmin);
  console.log("About to render admin interface:", isAdmin);

  if (isAdmin) {
    console.log("Rendering admin interface");
    return (
      <AdminAuthProvider>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="brands" element={<BrandManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminAuthProvider>
    );
  }

  console.log("Rendering partner interface (not admin)");
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      <Route path="/admin/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
