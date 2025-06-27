import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Mail,
  BarChart3,
  Settings,
  UserPlus,
  Shield,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Brand Onboarding", href: "/admin/onboarding", icon: UserPlus },
  { name: "Brand Management", href: "/admin/brands", icon: Users },
  { name: "Product Management", href: "/admin/products", icon: Package },
  { name: "Support Requests", href: "/admin/support", icon: Mail },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
}: AdminSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white/80 lg:backdrop-blur-sm lg:border-r lg:border-white/20 lg:shadow-xl">
        <SidebarContent onItemClick={() => {}} />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-slate-200
        transform transition-transform duration-300 ease-in-out lg:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Admin</span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <SidebarContent onItemClick={() => setSidebarOpen(false)} />
      </div>
    </>
  );
}

function SidebarContent({ onItemClick }: { onItemClick: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo - Only show on desktop */}
      <div className="hidden lg:block p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900">Stylsia</span>
            <p className="text-sm text-slate-500">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.exact}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-red-50 text-red-700 border-r-2 border-red-500"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0 mr-3" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
