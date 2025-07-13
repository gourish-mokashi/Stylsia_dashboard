import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Shield } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';

export default function Settings() {
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState({
    email: 'demo@stylsia.com',
  });
  const [saving, setSaving] = useState(false);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to save account settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleContactSupport = () => {
    const supportEmail = 'support@stylsia.com';
    const subject = 'Password Change Request - Stylsia Partner Dashboard';
    const body = `Dear Stylsia Support Team,

I would like to request a password change for my partner account.

Account Details:
- Email: ${accountData.email}
- Request Type: Password Change
- Date: ${new Date().toLocaleDateString()}

Please assist me with changing my password. I understand that for security reasons, password changes need to be handled by the support team.

Thank you for your assistance.

Best regards,
[Your Name]
[Your Company/Brand Name]`;

    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  return (
    <div className="p-6">
      <Header 
        title="Settings" 
        subtitle="Manage your account security settings"
      />
      
      <div className="mt-6 space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Shield className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
          </div>
          
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveAccount(); }}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={accountData.email}
                onChange={handleAccountChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Password Change Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Password Change</h4>
              <p className="text-sm text-gray-600 mb-3">
                For security reasons, password changes must be handled by our support team.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleContactSupport}
              >
                Contact Support
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" icon={Save} loading={saving}>
                Save Email Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Support */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Shield className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Support</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Need help? Our support team is here to assist you with any questions or issues.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate('/dashboard/messages')}>Contact Support</Button>
              <Button variant="outline">View Documentation</Button>
              <Button variant="outline">Report a Bug</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}