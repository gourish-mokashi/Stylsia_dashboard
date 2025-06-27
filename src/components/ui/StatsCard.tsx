import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  color?: 'primary' | 'green' | 'blue' | 'amber' | 'red';
  loading?: boolean;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'primary',
  loading = false 
}: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 animate-scale-in">
      {/* Responsive padding */}
      <div className="p-4 sm:p-6">
        {/* Header with icon and change indicator */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`p-2 sm:p-2.5 rounded-lg ${colorClasses[color]} transition-transform hover:scale-105`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          {change && (
            <span className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {change}
            </span>
          )}
        </div>
        
        {/* Stats content with responsive typography */}
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {value}
          </p>
          <p className="text-sm sm:text-base text-gray-600 leading-tight">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}