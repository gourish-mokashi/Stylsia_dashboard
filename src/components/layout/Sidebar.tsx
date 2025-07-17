import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  User,
  Settings,
  Mail,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "My Products", href: "/dashboard/products", icon: Package },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Brand Profile", href: "/dashboard/profile", icon: User },
  { name: "Support", href: "/dashboard/messages", icon: Mail },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:bg-white md:border-r md:border-gray-200">
        <SidebarContent
          handleSignOut={handleSignOut}
          onItemClick={() => {}} // No action needed on desktop
        />
      </div>

      {/* Mobile Sidebar - Slide in from left */}
      <div
        className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out md:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src="/img/logo.png" alt="Stylsia" className="h-8 w-8 rounded-full object-cover" />
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors touch-target"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <SidebarContent
          handleSignOut={handleSignOut}
          onItemClick={() => setSidebarOpen(false)} // Close sidebar on mobile when item clicked
        />
      </div>
    </>
  );
}

interface SidebarContentProps {
  handleSignOut: () => void;
  onItemClick: () => void;
}

function SidebarContent({ handleSignOut, onItemClick }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo - Only show on desktop (mobile has it in header) */}
      <div className="hidden md:block p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img src="/img/logo.png" alt="Stylsia" className="h-8 w-8 rounded-full object-cover" />
        </div>
        <p className="text-sm text-gray-500 mt-1">Partner Dashboard</p>
      </div>

      {/* Navigation - Responsive spacing and touch targets */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.exact || false}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 touch-target ${
                isActive
                  ? "bg-primary-50 text-primary-700 border-r-2 border-primary-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Logout - Responsive spacing */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 w-full px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 touch-target"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
