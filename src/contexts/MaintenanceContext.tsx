import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";

interface MaintenanceContextType {
  maintenanceMode: boolean;
  setMaintenanceMode: (enabled: boolean) => void;
  loading: boolean;
  error: string | null;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(
  undefined
);

export function MaintenanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [maintenanceMode, setMaintenanceModeState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch maintenance status from database
  const fetchMaintenanceStatus = useCallback(async () => {
    try {
      setError(null);

      // First, try to check if table exists
      const tableExists = await ensureSystemSettingsTable();

      if (!tableExists) {
        // Fallback to localStorage if table doesn't exist
        console.info("Using localStorage for maintenance mode");
        const localMaintenance = localStorage.getItem("maintenance_mode");
        setMaintenanceModeState(localMaintenance === "true");
        return;
      }

      // Get maintenance mode from database
      const { data, error: dbError } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .single();

      if (dbError && dbError.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error("Database error fetching maintenance status:", dbError);
        // Fallback to localStorage if database fails
        const localMaintenance = localStorage.getItem("maintenance_mode");
        setMaintenanceModeState(localMaintenance === "true");
      } else if (data?.value) {
        const isMaintenanceMode = data.value === true || data.value === "true";
        setMaintenanceModeState(isMaintenanceMode);
        // Also update localStorage as backup
        localStorage.setItem("maintenance_mode", isMaintenanceMode.toString());
      } else {
        // Default to false if no setting found, and create the default setting
        setMaintenanceModeState(false);
        localStorage.setItem("maintenance_mode", "false");

        // Try to create default maintenance mode setting
        await createDefaultMaintenanceSetting();
      }
    } catch (error) {
      console.error("Error fetching maintenance status:", error);
      setError("Failed to fetch maintenance status");

      // Fallback to localStorage
      const localMaintenance = localStorage.getItem("maintenance_mode");
      setMaintenanceModeState(localMaintenance === "true");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ensure system_settings table exists
  const ensureSystemSettingsTable = async () => {
    try {
      // Try a simple query first to check if table exists
      const { error } = await supabase
        .from("system_settings")
        .select("id")
        .limit(1);

      // If table doesn't exist, we'll just use localStorage as fallback
      // The table should be created manually in Supabase dashboard
      if (
        error &&
        (error.code === "42P01" || error.message.includes("does not exist"))
      ) {
        console.warn(
          "system_settings table does not exist. Please run the SQL script in your Supabase dashboard."
        );
        console.warn(
          "Until then, maintenance mode will use localStorage only."
        );
        return false;
      }
      return true;
    } catch (err) {
      console.warn("Could not check if system_settings table exists:", err);
      return false;
    }
  };

  // Create default maintenance setting
  const createDefaultMaintenanceSetting = async () => {
    try {
      await supabase.from("system_settings").insert({
        key: "maintenance_mode",
        value: false,
        description:
          "Global maintenance mode flag - when true, the platform shows maintenance page to regular users",
      });
    } catch (err) {
      console.warn("Could not create default maintenance setting:", err);
    }
  };

  // Update maintenance mode in database
  const setMaintenanceMode = useCallback(
    async (enabled: boolean) => {
      try {
        setError(null);
        setLoading(true);

        // Check if table exists first
        const tableExists = await ensureSystemSettingsTable();

        if (!tableExists) {
          // Fallback to localStorage only if table doesn't exist
          console.info(
            "Using localStorage for maintenance mode - database table not available"
          );
          setMaintenanceModeState(enabled);
          localStorage.setItem("maintenance_mode", enabled.toString());
          console.log(
            `Maintenance mode ${
              enabled ? "enabled" : "disabled"
            } locally (localStorage only)`
          );
          return;
        }

        // Update in database directly
        const { error: updateError } = await supabase
          .from("system_settings")
          .upsert(
            {
              key: "maintenance_mode",
              value: enabled,
              updated_at: new Date().toISOString(),
              updated_by: (await supabase.auth.getUser()).data.user?.id,
            },
            {
              onConflict: "key",
            }
          );

        if (updateError) {
          console.error(
            "Error updating maintenance mode in database:",
            updateError
          );
          throw updateError;
        }

        // Update local state
        setMaintenanceModeState(enabled);

        // Update localStorage as backup
        localStorage.setItem("maintenance_mode", enabled.toString());

        console.log(
          `Maintenance mode ${enabled ? "enabled" : "disabled"} globally`
        );
      } catch (error) {
        console.error("Error setting maintenance mode:", error);
        setError(
          `Failed to ${enabled ? "enable" : "disable"} maintenance mode`
        );

        // Revert local state if database update failed
        await fetchMaintenanceStatus();
      } finally {
        setLoading(false);
      }
    },
    [fetchMaintenanceStatus]
  );

  // Set up real-time subscription for maintenance mode changes
  useEffect(() => {
    fetchMaintenanceStatus();

    // Subscribe to changes in system_settings table
    const subscription = supabase
      .channel("system_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "system_settings",
          filter: "key=eq.maintenance_mode",
        },
        (payload) => {
          console.log("Maintenance mode changed:", payload);
          if (payload.new && "value" in payload.new) {
            const isMaintenanceMode =
              payload.new.value === true || payload.new.value === "true";
            setMaintenanceModeState(isMaintenanceMode);
            localStorage.setItem(
              "maintenance_mode",
              isMaintenanceMode.toString()
            );
          }
        }
      )
      .subscribe();

    // Periodic sync as fallback (every 30 seconds)
    const syncInterval = setInterval(() => {
      fetchMaintenanceStatus();
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(syncInterval);
    };
  }, [fetchMaintenanceStatus]);

  return (
    <MaintenanceContext.Provider
      value={{
        maintenanceMode,
        setMaintenanceMode,
        loading,
        error,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenanceMode() {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error(
      "useMaintenanceMode must be used within a MaintenanceProvider"
    );
  }
  return context;
}
