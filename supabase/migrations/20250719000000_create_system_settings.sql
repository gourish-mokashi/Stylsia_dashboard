-- =============================================
-- SYSTEM SETTINGS TABLE FOR GLOBAL CONFIGURATION
-- =============================================
-- This migration creates a system_settings table for global platform configuration

-- =============================================
-- 1. CREATE SYSTEM_SETTINGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create unique index on key
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON system_settings(updated_at DESC);

-- =============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. CREATE RLS POLICIES
-- =============================================

-- Anyone can read system settings (for maintenance mode checks)
CREATE POLICY "Anyone can read system settings"
ON system_settings
FOR SELECT
USING (true);

-- Only admins can modify system settings
CREATE POLICY "Only admins can modify system settings"
ON system_settings
FOR ALL
USING (
    auth.role() = 'authenticated' AND
    (
        (auth.jwt() ->> 'email') IN ('admin@stylsia.com', 'support@stylsia.com', 'manager@stylsia.com')
        OR (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    )
);

-- =============================================
-- 4. INSERT DEFAULT SETTINGS
-- =============================================

-- Insert default maintenance mode setting
INSERT INTO system_settings (key, value, description)
VALUES (
    'maintenance_mode',
    'false'::jsonb,
    'Global maintenance mode flag - when true, the platform shows maintenance page to regular users'
) ON CONFLICT (key) DO NOTHING;

-- Insert platform configuration settings
INSERT INTO system_settings (key, value, description)
VALUES (
    'platform_config',
    '{
        "name": "Stylsia",
        "version": "1.0.0",
        "maintenance_message": "We are currently performing scheduled maintenance to improve your experience.",
        "maintenance_estimated_time": "We will be back online soon!"
    }'::jsonb,
    'General platform configuration settings'
) ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 5. CREATE FUNCTION TO UPDATE SETTINGS
-- =============================================

CREATE OR REPLACE FUNCTION update_system_setting(
    setting_key TEXT,
    setting_value JSONB,
    user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT (
        auth.role() = 'authenticated' AND
        (
            (auth.jwt() ->> 'email') IN ('admin@stylsia.com', 'support@stylsia.com', 'manager@stylsia.com')
            OR (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
        )
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can update system settings';
    END IF;

    -- Update or insert the setting
    INSERT INTO system_settings (key, value, updated_by)
    VALUES (setting_key, setting_value, user_id)
    ON CONFLICT (key) 
    DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW(),
        updated_by = EXCLUDED.updated_by;
    
    RETURN TRUE;
END;
$$;

-- =============================================
-- 6. CREATE FUNCTION TO GET SETTINGS
-- =============================================

CREATE OR REPLACE FUNCTION get_system_setting(setting_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    setting_value JSONB;
BEGIN
    SELECT value INTO setting_value
    FROM system_settings
    WHERE key = setting_key;
    
    RETURN COALESCE(setting_value, 'null'::jsonb);
END;
$$;

-- =============================================
-- 7. CREATE AUDIT TRIGGER FOR SYSTEM SETTINGS
-- =============================================

-- Function to log system settings changes
CREATE OR REPLACE FUNCTION log_system_settings_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log the change in audit_logs if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        INSERT INTO audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            details
        ) VALUES (
            auth.uid(),
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'INSERT'
                WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
                WHEN TG_OP = 'DELETE' THEN 'DELETE'
            END,
            'system_settings',
            COALESCE(NEW.key, OLD.key),
            jsonb_build_object(
                'key', COALESCE(NEW.key, OLD.key),
                'old_value', CASE WHEN TG_OP != 'INSERT' THEN OLD.value ELSE NULL END,
                'new_value', CASE WHEN TG_OP != 'DELETE' THEN NEW.value ELSE NULL END,
                'operation', TG_OP
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_log_system_settings_changes ON system_settings;
CREATE TRIGGER trigger_log_system_settings_changes
    AFTER INSERT OR UPDATE OR DELETE
    ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION log_system_settings_changes();
