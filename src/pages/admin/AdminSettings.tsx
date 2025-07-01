import { useState, useEffect } from "react";
import {
  Save,
  Settings as SettingsIcon,
  Activity,
  FileText,
} from "lucide-react";
import Button from "../../components/ui/Button";
import AuditLogViewer from "../../components/common/AuditLogViewer";
import { supabase } from "../../lib/supabase";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("global");
  const [globalSettings, setGlobalSettings] = useState({
    maintenanceMode: false,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: "global", name: "Global Settings", icon: SettingsIcon },
    { id: "logs", name: "Audit Logs", icon: Activity },
  ];

  // Fetch settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // In a real implementation, this would fetch from a settings table
        // For now, we'll use mock data
        console.log("Fetching settings...");
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleGlobalSettingsChange = (key: string, value: any) => {
    setGlobalSettings((prev) => ({
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Record audit log
      await supabase.rpc("record_audit_event", {
        user_uuid: (await supabase.auth.getUser()).data.user?.id,
        action_name: "UPDATE",
        table_name: "settings",
        record_id: "global",
        details_json: globalSettings,
      });

      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
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
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
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
        {activeTab === "global" && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Platform Configuration
            </h2>

            {/* Success message */}
            {saveSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                <FileText className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">
                  Settings saved successfully!
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">
                      Maintenance Mode
                    </h3>
                    <p className="text-sm text-slate-600">
                      Temporarily disable the platform
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={globalSettings.maintenanceMode}
                      onChange={(e) =>
                        handleGlobalSettingsChange(
                          "maintenanceMode",
                          e.target.checked
                        )
                      }
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
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === "logs" && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Audit Logs
            </h2>
            <AuditLogViewer showFilters={true} limit={10} />
          </div>
        )}
      </div>
    </div>
  );
}
