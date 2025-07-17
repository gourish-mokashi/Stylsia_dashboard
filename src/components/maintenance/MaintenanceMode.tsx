import { AlertTriangle, Clock, Wrench } from 'lucide-react';

interface MaintenanceModeProps {
  message?: string;
  estimatedTime?: string;
}

export default function MaintenanceMode({ 
  message = "We're currently performing scheduled maintenance to improve your experience.",
  estimatedTime = "We'll be back online soon!"
}: MaintenanceModeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <Wrench className="w-10 h-10 text-red-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Under Maintenance
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Estimated Time */}
        <div className="flex items-center justify-center space-x-2 text-orange-600 mb-8">
          <Clock className="w-5 h-5" />
          <span className="font-medium">{estimatedTime}</span>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Brand Logo */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <img 
              src="/img/logo.png" 
              alt="Brand Logo" 
              className="h-8 w-auto"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Fashion & Lifestyle Platform
          </p>
        </div>

        {/* Contact Information */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Need immediate assistance?
          </p>
          <button 
            onClick={() => {
              const subject = 'Website Maintenance - Need Assistance';
              const body = `Dear Stylsia Support Team,

I am trying to access the Stylsia platform but it appears to be under maintenance.

Request Details:
- Date: ${new Date().toLocaleDateString()}
- Time: ${new Date().toLocaleTimeString()}
- Issue: Website under maintenance

Could you please provide an update on when the platform will be available again?

Thank you for your assistance.

Best regards`;
              
              const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=support@stylsia.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              window.open(gmailUrl, '_blank');
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium underline"
          >
            Contact our support team
          </button>
        </div>
      </div>
    </div>
  );
}
