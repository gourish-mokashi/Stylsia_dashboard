import React from 'react';
import { Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Responsive padding and layout */}
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {/* Title section - Responsive typography */}
          <div className="min-w-0 flex-1">
            <h1 className="text-fluid-2xl font-bold text-gray-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-fluid-sm text-gray-600 mt-1 line-clamp-2">{subtitle}</p>
            )}
          </div>
          
          {/* Actions section - Responsive layout */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search - Hide on mobile, show on tablet+ */}
            <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48 lg:w-64 text-sm"
              />
            </div>
            
            {/* Mobile search button */}
            <button className="sm:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors touch-target rounded-lg hover:bg-gray-100">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}