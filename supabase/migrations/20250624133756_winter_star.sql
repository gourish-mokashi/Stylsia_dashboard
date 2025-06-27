-- =============================================
-- AUDIT LOGGING SYSTEM FOR STYLSIA
-- =============================================
-- This migration creates a comprehensive audit logging system

-- =============================================
-- 1. CREATE AUDIT LOGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'OTHER')),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- =============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. CREATE RLS POLICIES
-- =============================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON audit_logs
FOR SELECT
USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- =============================================
-- 4. CREATE AUDIT FUNCTIONS
-- =============================================

-- Function to record an audit event
CREATE OR REPLACE FUNCTION record_audit_event(
    user_uuid UUID,
    action_name TEXT,
    table_name TEXT,
    record_id TEXT,
    details_json JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    -- Validate action
    IF action_name NOT IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'OTHER') THEN
        action_name := 'OTHER';
    END IF;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        details
    ) VALUES (
        user_uuid,
        action_name,
        table_name,
        record_id,
        details_json
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get filtered audit logs
CREATE OR REPLACE FUNCTION get_audit_logs(
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL,
    filter_user_id UUID DEFAULT NULL,
    action_filter TEXT DEFAULT NULL,
    table_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    log_id UUID,
    log_user_id UUID,
    user_email TEXT,
    log_action TEXT,
    log_table_name TEXT,
    log_record_id TEXT,
    log_created_at TIMESTAMPTZ,
    log_details JSONB,
    total_count BIGINT
) AS $$
DECLARE
    total BIGINT;
BEGIN
    -- Calculate total count for pagination
    SELECT COUNT(*) INTO total
    FROM audit_logs al
    WHERE (start_date IS NULL OR al.created_at >= start_date)
      AND (end_date IS NULL OR al.created_at <= end_date)
      AND (filter_user_id IS NULL OR al.user_id = filter_user_id)
      AND (action_filter IS NULL OR al.action = action_filter)
      AND (table_filter IS NULL OR al.table_name = table_filter);
    
    -- Return filtered logs with user email
    RETURN QUERY
    SELECT 
        al.id as log_id,
        al.user_id as log_user_id,
        u.email as user_email,
        al.action as log_action,
        al.table_name as log_table_name,
        al.record_id as log_record_id,
        al.created_at as log_created_at,
        al.details as log_details,
        total as total_count
    FROM audit_logs al
    LEFT JOIN auth.users u ON al.user_id = u.id
    WHERE (start_date IS NULL OR al.created_at >= start_date)
      AND (end_date IS NULL OR al.created_at <= end_date)
      AND (filter_user_id IS NULL OR al.user_id = filter_user_id)
      AND (action_filter IS NULL OR al.action = action_filter)
      AND (table_filter IS NULL OR al.table_name = table_filter)
    ORDER BY al.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit history for a specific record
CREATE OR REPLACE FUNCTION get_record_audit_history(
    target_table_name TEXT,
    target_record_id TEXT,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    log_id UUID,
    log_user_id UUID,
    user_email TEXT,
    log_action TEXT,
    log_table_name TEXT,
    log_record_id TEXT,
    log_created_at TIMESTAMPTZ,
    log_details JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id as log_id,
        al.user_id as log_user_id,
        u.email as user_email,
        al.action as log_action,
        al.table_name as log_table_name,
        al.record_id as log_record_id,
        al.created_at as log_created_at,
        al.details as log_details
    FROM audit_logs al
    LEFT JOIN auth.users u ON al.user_id = u.id
    WHERE al.table_name = target_table_name
      AND al.record_id = target_record_id
    ORDER BY al.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION record_audit_event(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_logs(TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_record_audit_history(TEXT, TEXT, INTEGER) TO authenticated;

-- =============================================
-- 6. VERIFICATION
-- =============================================

-- Verify table was created
DO $$
DECLARE
  table_exists BOOLEAN;
  function_count INTEGER;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) INTO table_exists;
  
  -- Count created functions
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
    AND routine_name IN (
      'record_audit_event',
      'get_audit_logs',
      'get_record_audit_history'
    );
  
  RAISE NOTICE 'Audit logs table exists: %', table_exists;
  RAISE NOTICE 'Audit functions created: %', function_count;
  
  IF table_exists AND function_count = 3 THEN
    RAISE NOTICE 'Audit logging system created successfully!';
  ELSE
    RAISE WARNING 'Audit logging system may not have been created properly.';
  END IF;
END $$;

-- =============================================
-- 7. FINAL SETUP MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== AUDIT LOGGING SYSTEM SETUP COMPLETE ===';
  RAISE NOTICE 'The following components have been set up:';
  RAISE NOTICE '- Audit logs table with indexes';
  RAISE NOTICE '- Row Level Security policies';
  RAISE NOTICE '- Audit event recording function';
  RAISE NOTICE '- Audit log retrieval functions';
  RAISE NOTICE '';
  RAISE NOTICE 'The system now provides:';
  RAISE NOTICE '- Comprehensive audit trail for all database changes';
  RAISE NOTICE '- Secure access controls for audit data';
  RAISE NOTICE '- Flexible filtering and retrieval of audit history';
  RAISE NOTICE '- Record-specific audit trails';
END $$;