import React, { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Clock,
  Shield,
} from "lucide-react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import Button from "../ui/Button";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function AdminHeader({
  sidebarOpen,
  setSidebarOpen,
}: AdminHeaderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string>("");
  const { user, signOut, sessionExpiry, refreshSession, isSessionValid } =
    useAdminAuth();

  // Update session countdown
  useEffect(() => {
    if (!sessionExpiry) return;

    const updateCountdown = () => {
      const now = new Date();
      const timeLeft = sessionExpiry.getTime() - now.getTime();

      if (timeLeft <= 0) {
        setSessionTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setSessionTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setSessionTimeLeft(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sessionExpiry]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

  const handleRefreshSession = async () => {
    const success = await refreshSession();
    if (!success) {
      console.warn("Failed to refresh session");
    }
  };

  const getSessionStatus = () => {
    if (!sessionExpiry)
      return { color: "text-slate-500", status: "No session" };

    const now = new Date();
    const timeLeft = sessionExpiry.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));

    if (timeLeft <= 0) {
      return { color: "text-red-500", status: "Expired" };
    } else if (minutesLeft <= 5) {
      return { color: "text-amber-500", status: "Expiring soon" };
    } else if (minutesLeft <= 30) {
      return { color: "text-yellow-500", status: "Active" };
    } else {
      return { color: "text-green-500", status: "Active" };
    }
  };

  const sessionStatus = getSessionStatus();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-white/60 hover:shadow-md transition-all duration-200"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="hidden sm:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Session Status */}
          {sessionExpiry && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-50 rounded-lg">
              <Clock className={`h-4 w-4 ${sessionStatus.color}`} />
              <span className="text-sm text-slate-600">
                Session: {sessionTimeLeft}
              </span>
              {sessionTimeLeft !== "Expired" && (
                <button
                  onClick={handleRefreshSession}
                  className="text-xs text-blue-600 hover:text-blue-700"
                  title="Refresh session"
                >
                  Refresh
                </button>
              )}
            </div>
          )}

          {/* Mobile search button */}
          <button className="sm:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
            <Search className="h-5 w-5" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {user?.email?.split("@")[0] || "Admin"}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                <div className="p-4">
                  {/* User Info */}
                  <div className="px-3 py-2 text-sm border-b border-slate-200 mb-2">
                    <div className="font-medium text-slate-900">
                      {user?.email}
                    </div>
                    <div className="flex items-center mt-1 space-x-2">
                      <Shield className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-slate-500">
                        Administrator
                      </span>
                    </div>
                  </div>

                  {/* Session Info */}
                  {sessionExpiry && (
                    <div className="px-3 py-2 text-xs bg-slate-50 rounded-lg mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Session Status:</span>
                        <span className={sessionStatus.color}>
                          {sessionStatus.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-slate-600">Time Left:</span>
                        <span className="text-slate-900">
                          {sessionTimeLeft}
                        </span>
                      </div>
                      {!isSessionValid() && (
                        <div className="mt-2">
                          <button
                            onClick={handleRefreshSession}
                            className="w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            Refresh Session
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
