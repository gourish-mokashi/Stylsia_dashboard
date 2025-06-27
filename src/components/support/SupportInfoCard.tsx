import React from 'react';
import { Mail } from 'lucide-react';

interface SupportInfoCardProps {
  email?: string;
  responseTime?: string;
}

export default function SupportInfoCard({ 
  email = 'support@company.com',
  responseTime = '24 hours'
}: SupportInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Email Support</h2>
            <p className="text-gray-600">We typically respond within {responseTime}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-primary-600">
          <Mail className="h-5 w-5" />
          <span className="font-medium">{email}</span>
        </div>
      </div>
    </div>
  );
}