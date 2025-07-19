import { supabase } from "../lib/supabase";

/**
 * Initialize system settings in the database
 * This creates the system_settings table if it doesn't exist and sets up default values
 */
export async function initializeSystemSettings() {
  try {
    console.log("Initializing system settings...");

    // First, check if system_settings table exists by trying to query it
    const { error: checkError } = await supabase
      .from("system_settings")
      .select("id")
      .limit(1);

    if (checkError && checkError.code === "42P01") {
      // Table doesn't exist, create it
      console.log("Creating system_settings table...");

      // Create system_settings table
      const { error: createError } = await supabase.rpc(
        "create_system_settings_table"
      );

      if (createError) {
        console.error("Error creating system_settings table:", createError);
        throw createError;
      }
    }

    // Insert or update default maintenance mode setting
    const { error: upsertError } = await supabase
      .from("system_settings")
      .upsert(
        {
          key: "maintenance_mode",
          value: false,
          description:
            "Global maintenance mode flag - when true, the platform shows maintenance page to regular users",
        },
        {
          onConflict: "key",
          ignoreDuplicates: false,
        }
      );

    if (upsertError) {
      console.error("Error setting up maintenance mode setting:", upsertError);
      throw upsertError;
    }

    // Insert or update platform configuration
    const { error: platformError } = await supabase
      .from("system_settings")
      .upsert(
        {
          key: "platform_config",
          value: {
            name: "Stylsia",
            version: "1.0.0",
            maintenance_message:
              "We are currently performing scheduled maintenance to improve your experience.",
            maintenance_estimated_time: "We will be back online soon!",
          },
          description: "General platform configuration settings",
        },
        {
          onConflict: "key",
          ignoreDuplicates: false,
        }
      );

    if (platformError) {
      console.error("Error setting up platform config:", platformError);
      throw platformError;
    }

    console.log("System settings initialized successfully");
    return { success: true };
  } catch (error) {
    console.error("Failed to initialize system settings:", error);
    return { success: false, error };
  }
}

/**
 * Get a system setting value
 */
export async function getSystemSetting(key: string) {
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error) {
      console.error(`Error getting system setting '${key}':`, error);
      return null;
    }

    return data?.value;
  } catch (error) {
    console.error(`Error getting system setting '${key}':`, error);
    return null;
  }
}

/**
 * Update a system setting value
 */
export async function updateSystemSetting(
  key: string,
  value: boolean | string | number | object
) {
  try {
    const { error } = await supabase.from("system_settings").upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      },
      {
        onConflict: "key",
      }
    );

    if (error) {
      console.error(`Error updating system setting '${key}':`, error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error(`Error updating system setting '${key}':`, error);
    throw error;
  }
}
