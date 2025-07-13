import { useState } from "react";
import { Menu, LogOut, User, Shield } from "lucide-react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function AdminHeader({
  sidebarOpen,
  setSidebarOpen,
}: AdminHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, signOut } = useAdminAuth();

  const handleSignOut = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

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
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
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
