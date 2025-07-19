-- System Settings Table for Stylsia Dashboard
-- Execute this SQL in your Supabase SQL Editor

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON system_settings(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can read system settings"
ON system_settings
FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify system settings"
ON system_settings
FOR ALL
USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() ->> 'email') IN ('admin@stylsia.com', 'support@stylsia.com', 'manager@stylsia.com')
);

-- Insert default settings
INSERT INTO system_settings (key, value, description)
VALUES (
    'maintenance_mode',
    'false'::jsonb,
    'Global maintenance mode flag - when true, the platform shows maintenance page to regular users'
) ON CONFLICT (key) DO NOTHING;

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
