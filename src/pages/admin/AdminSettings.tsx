import { useState, useEffect } from "react";
import {
  Save,
  Settings as SettingsIcon,
  Activity,
  FileText,
  AlertTriangle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import AuditLogViewer from "../../components/common/AuditLogViewer";
import { useMaintenanceMode } from "../../contexts/MaintenanceContext";

export default function AdminSettings() {
  const {
    maintenanceMode,
    setMaintenanceMode,
    loading: maintenanceLoading,
    error: maintenanceError,
  } = useMaintenanceMode();
  const [activeTab, setActiveTab] = useState("global");
  const [globalSettings, setGlobalSettings] = useState({
    maintenanceMode: false,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const tabs = [
    { id: "global", name: "Global Settings", icon: SettingsIcon },
    { id: "logs", name: "Audit Logs", icon: Activity },
  ];

  // Fetch settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Update local state with maintenance context
        setGlobalSettings((prev) => ({
          ...prev,
          maintenanceMode: maintenanceMode,
        }));
        console.log("Settings synced with maintenance context");
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    if (!maintenanceLoading) {
      fetchSettings();
    }
  }, [maintenanceMode, maintenanceLoading]);

  const handleGlobalSettingsChange = async (
    key: string,
    value: boolean | string | number
  ) => {
    setGlobalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    // If changing maintenance mode, update the context immediately
    if (key === "maintenanceMode" && typeof value === "boolean") {
      try {
        setSaving(true);
        setSaveError(null);
        await setMaintenanceMode(value);
        setSaveSuccess(true);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } catch (error) {
        console.error("Error updating maintenance mode:", error);
        setSaveError("Failed to update maintenance mode");

        // Revert the local state
        setGlobalSettings((prev) => ({
          ...prev,
          maintenanceMode: !value,
        }));

        setTimeout(() => {
          setSaveError(null);
        }, 5000);
      } finally {
        setSaving(false);
      }
    }

    // Clear success message when user makes other changes
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);

    try {
      // Simple frontend-only save simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

            {/* Error message */}
            {saveError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{saveError}</p>
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
                      {saving
                        ? "Updating..."
                        : "Temporarily disable the platform for all users"}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={globalSettings.maintenanceMode}
                      disabled={saving || maintenanceLoading}
                      onChange={(e) =>
                        handleGlobalSettingsChange(
                          "maintenanceMode",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                      title="Toggle maintenance mode for the entire platform"
                    />
                    <div
                      className={`w-11 h-6 ${
                        saving || maintenanceLoading
                          ? "bg-slate-300 cursor-not-allowed"
                          : "bg-slate-200"
                      } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${
                        saving || maintenanceLoading
                          ? "peer-checked:bg-red-300"
                          : ""
                      }`}
                    ></div>
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
