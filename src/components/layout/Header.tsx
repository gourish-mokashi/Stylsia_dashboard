import React from 'react';

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
            {/* Reserved for future actions */}
          </div>
        </div>
      </div>
    </div>
  );
}