import React, { useState, useEffect } from 'react';
import { Save, Users, Settings as SettingsIcon, Activity, Shield, FileText } from 'lucide-react';
import Button from '../../components/ui/Button';
import AuditLogViewer from '../../components/common/AuditLogViewer';
import { supabase } from '../../lib/supabase';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('global');
  const [globalSettings, setGlobalSettings] = useState({
    platformName: 'Stylsia',
    maintenanceMode: false,
    newRegistrations: true,
    productApprovalRequired: true,
    maxProductsPerBrand: 100,
    commissionRate: 5,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: 'global', name: 'Global Settings', icon: SettingsIcon },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'logs', name: 'Audit Logs', icon: Activity },
  ];

  // Fetch settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // In a real implementation, this would fetch from a settings table
        // For now, we'll use mock data
        console.log('Fetching settings...');
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleGlobalSettingsChange = (key: string, value: any) => {
    setGlobalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // Clear success message when user makes changes
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      // In a real implementation, this would save to a settings table
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Record audit log
      await supabase.rpc('record_audit_event', {
        user_uuid: (await supabase.auth.getUser()).data.user?.id,
        action_name: 'UPDATE',
        table_name: 'settings',
        record_id: 'global',
        details_json: globalSettings
      });
      
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Admin Settings
        </h1>
        <p className="text-slate-600 mt-1">
          Manage platform settings and configurations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Global Settings */}
        {activeTab === 'global' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Platform Configuration</h2>
            
            {/* Success message */}
            {saveSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                <FileText className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">Settings saved successfully!</p>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={globalSettings.platformName}
                  onChange={(e) => handleGlobalSettingsChange('platformName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Products per Brand
                  </label>
                  <input
                    type="number"
                    value={globalSettings.maxProductsPerBrand}
                    onChange={(e) => handleGlobalSettingsChange('maxProductsPerBrand', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={globalSettings.commissionRate}
                    onChange={(e) => handleGlobalSettingsChange('commissionRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300  rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Maintenance Mode</h3>
                    <p className="text-sm text-slate-600">Temporarily disable the platform</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={globalSettings.maintenanceMode}
                      onChange={(e) => handleGlobalSettingsChange('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">New Registrations</h3>
                    <p className="text-sm text-slate-600">Allow new brand registrations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={globalSettings.newRegistrations}
                      onChange={(e) => handleGlobalSettingsChange('newRegistrations', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Product Approval Required</h3>
                    <p className="text-sm text-slate-600">Require admin approval for new products</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={globalSettings.productApprovalRequired}
                      onChange={(e) => handleGlobalSettingsChange('productApprovalRequired', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSettings} 
                  icon={Save} 
                  loading={saving}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Admin Users</h2>
              <Button>Add New User</Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { id: 1, name: 'John Admin', email: 'admin@stylsia.com', role: 'admin', status: 'active' },
                    { id: 2, name: 'Sarah Manager', email: 'sarah@stylsia.com', role: 'manager', status: 'active' },
                    { id: 3, name: 'Mike Support', email: 'mike@stylsia.com', role: 'support', status: 'inactive' },
                  ].map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 hover:text-red-900 mr-3">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Security Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-3">Password Policy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Minimum Password Length</p>
                      <p className="text-xs text-slate-500">Minimum number of characters required</p>
                    </div>
                    <select className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                      <option value="8">8 characters</option>
                      <option value="10">10 characters</option>
                      <option value="12">12 characters</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Require Special Characters</p>
                      <p className="text-xs text-slate-500">Passwords must contain special characters</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Password Expiry</p>
                      <p className="text-xs text-slate-500">Force password reset after period</p>
                    </div>
                    <select className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                      <option value="never">Never</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-3">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Require 2FA for Admins</p>
                    <p className="text-xs text-slate-500">All admin users must use two-factor authentication</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button icon={Save}>
                  Save Security Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === 'logs' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Audit Logs</h2>
            <AuditLogViewer showFilters={true} limit={10} />
          </div>
        )}
      </div>
    </div>
  );
}
