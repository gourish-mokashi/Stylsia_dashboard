import React from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface ConnectionErrorProps {
  onRetry?: () => void;
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({ onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Connection Error
        </h1>
        
        <p className="text-gray-600 mb-6">
          Unable to connect to the database. This could be due to:
        </p>
        
        <div className="text-left mb-6 space-y-2">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-sm text-gray-600">Missing or incorrect environment variables</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-sm text-gray-600">Database tables not set up</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-sm text-gray-600">Network connectivity issues</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Connection</span>
            </button>
          )}
          
          <a
            href="/SETUP_INSTRUCTIONS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Setup Instructions</span>
          </a>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Quick Fix:</strong> Check your <code>.env</code> file and ensure your Supabase URL and API key are correct.
          </p>
        </div>
      </div>
    </div>
  );
};