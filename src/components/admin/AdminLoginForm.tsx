import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import Button from '../ui/Button';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAdminAuth();

  // Load remember me preference
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('stylsia_admin_remember_me') === 'true';
    setRememberMe(savedRememberMe);
    
    // Pre-fill email if remember me was enabled
    if (savedRememberMe) {
      const lastEmail = localStorage.getItem('stylsia_admin_last_email');
      if (lastEmail) {
        setEmail(lastEmail);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password, rememberMe);
      
      if (!result.success) {
        setError(result.error || 'An error occurred');
      } else {
        // Save email for remember me functionality
        if (rememberMe) {
          localStorage.setItem('stylsia_admin_last_email', email);
        } else {
          localStorage.removeItem('stylsia_admin_last_email');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto h-12 w-12 bg-red-600 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Portal</h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">Stylsia Administration Dashboard</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-slide-up">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="admin@stylsia.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                    Remember me for 30 days
                  </label>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              fullWidth
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {loading ? 'Signing In...' : 'Access Admin Dashboard'}
            </Button>



            {/* Security Notice */}
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Secure session with automatic timeout after 2 hours of inactivity
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
