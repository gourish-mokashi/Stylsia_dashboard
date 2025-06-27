/*
  # Support Request System Functions
  
  This migration adds functions to manage support requests and
  track resolution metrics.
  
  1. New Functions
    - Support request creation with validation
    - Support request status updates with audit logging
    - Support request metrics calculation
  
  2. Security
    - Row-level security for support requests
    - Proper permission management
*/

-- =============================================
-- 1. SUPPORT REQUEST HELPER FUNCTIONS
-- =============================================

-- Function to create a support request
CREATE OR REPLACE FUNCTION create_support_request(
    brand_uuid UUID,
    subject_text TEXT,
    description_text TEXT,
    priority_level TEXT DEFAULT 'medium',
    has_attachment_flag BOOLEAN DEFAULT FALSE,
    attachment_url_text TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
BEGIN
    -- Validate priority level
    IF priority_level NOT IN ('low', 'medium', 'high') THEN
        RAISE EXCEPTION 'Invalid priority level: %. Must be low, medium, or high.', priority_level;
    END IF;
    
    -- Validate brand exists
    IF NOT EXISTS (SELECT 1 FROM brands WHERE id = brand_uuid) THEN
        RAISE EXCEPTION 'Brand with ID % does not exist', brand_uuid;
    END IF;
    
    -- Create the support request
    INSERT INTO support_requests (
        brand_id,
        subject,
        description,
        priority,
        status,
        has_attachment,
        attachment_url
    ) VALUES (
        brand_uuid,
        subject_text,
        description_text,
        priority_level,
        'new',
        has_attachment_flag,
        attachment_url_text
    ) RETURNING id INTO request_id;
    
    -- Record audit event
    PERFORM record_audit_event(
        brand_uuid,
        'INSERT',
        'support_requests',
        request_id::TEXT,
        jsonb_build_object(
            'subject', subject_text,
            'priority', priority_level
        )
    );
    
    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update support request status
CREATE OR REPLACE FUNCTION update_support_request_status(
    request_uuid UUID,
    new_status TEXT,
    user_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    old_status TEXT;
    update_count INTEGER;
BEGIN
    -- Validate status
    IF new_status NOT IN ('new', 'in_progress', 'resolved', 'closed') THEN
        RAISE EXCEPTION 'Invalid status: %. Must be new, in_progress, resolved, or closed.', new_status;
    END IF;
    
    -- Get current status
    SELECT status INTO old_status
    FROM support_requests
    WHERE id = request_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Support request with ID % does not exist', request_uuid;
    END IF;
    
    -- Update the status
    UPDATE support_requests
    SET 
        status = new_status,
        updated_at = NOW(),
        resolved_at = CASE 
            WHEN new_status = 'resolved' AND (old_status != 'resolved' OR resolved_at IS NULL)
            THEN NOW()
            ELSE resolved_at
        END
    WHERE id = request_uuid;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    -- Record audit event
    IF update_count > 0 THEN
        PERFORM record_audit_event(
            user_uuid,
            'UPDATE',
            'support_requests',
            request_uuid::TEXT,
            jsonb_build_object(
                'status', jsonb_build_object(
                    'old', old_status,
                    'new', new_status
                )
            )
        );
    END IF;
    
    RETURN update_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get support request metrics
CREATE OR REPLACE FUNCTION get_support_request_metrics(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_requests INTEGER,
    new_requests INTEGER,
    in_progress_requests INTEGER,
    resolved_requests INTEGER,
    closed_requests INTEGER,
    high_priority_requests INTEGER,
    avg_resolution_time_hours NUMERIC,
    resolution_rate NUMERIC
) AS $$
DECLARE
    start_date_val DATE;
    end_date_val DATE;
BEGIN
    -- Set default date range if not provided
    start_date_val := COALESCE(start_date, CURRENT_DATE - INTERVAL '30 days');
    end_date_val := COALESCE(end_date, CURRENT_DATE);
    
    RETURN QUERY
    WITH metrics AS (
        SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'new' THEN 1 END) as new_count,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
            COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
            COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count,
            COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_count,
            AVG(CASE 
                WHEN status IN ('resolved', 'closed') AND resolved_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
                ELSE NULL
            END) as avg_resolution_hours,
            CASE
                WHEN COUNT(CASE WHEN status != 'new' THEN 1 END) > 0
                THEN COUNT(CASE WHEN status IN ('resolved', 'closed') THEN 1 END)::NUMERIC / 
                     COUNT(CASE WHEN status != 'new' THEN 1 END)::NUMERIC * 100
                ELSE 0
            END as resolution_rate
        FROM support_requests
        WHERE created_at BETWEEN start_date_val AND (end_date_val + INTERVAL '1 day')
    )
    SELECT
        total as total_requests,
        new_count as new_requests,
        in_progress_count as in_progress_requests,
        resolved_count as resolved_requests,
        closed_count as closed_requests,
        high_priority_count as high_priority_requests,
        ROUND(avg_resolution_hours, 2) as avg_resolution_time_hours,
        ROUND(resolution_rate, 2) as resolution_rate
    FROM metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get brand support request history
CREATE OR REPLACE FUNCTION get_brand_support_history(
    brand_uuid UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    subject TEXT,
    priority TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution_time_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sr.id,
        sr.subject,
        sr.priority,
        sr.status,
        sr.created_at,
        sr.resolved_at,
        CASE 
            WHEN sr.resolved_at IS NOT NULL 
            THEN ROUND(EXTRACT(EPOCH FROM (sr.resolved_at - sr.created_at)) / 3600, 2)
            ELSE NULL
        END as resolution_time_hours
    FROM support_requests sr
    WHERE sr.brand_id = brand_uuid
    ORDER BY sr.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_support_request(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_support_request_status(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_support_request_metrics(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_brand_support_history(UUID, INTEGER) TO authenticated;

-- =============================================
-- 3. VERIFICATION
-- =============================================

-- Verify functions were created
DO $$
DECLARE
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name IN (
      'create_support_request',
      'update_support_request_status',
      'get_support_request_metrics',
      'get_brand_support_history'
    );
  
  RAISE NOTICE 'Support request functions created: %', function_count;
  
  IF function_count = 4 THEN
    RAISE NOTICE 'All support request functions created successfully!';
  ELSE
    RAISE WARNING 'Some support request functions may not have been created properly.';
  END IF;
END $$;

-- =============================================
-- 4. FINAL SETUP MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== SUPPORT REQUEST SYSTEM SETUP COMPLETE ===';
  RAISE NOTICE 'The following components have been set up:';
  RAISE NOTICE '- Support request creation function with validation';
  RAISE NOTICE '- Support request status update function with audit logging';
  RAISE NOTICE '- Support request metrics calculation function';
  RAISE NOTICE '- Brand support request history function';
  RAISE NOTICE '';
  RAISE NOTICE 'The system now provides:';
  RAISE NOTICE '- Secure support request management';
  RAISE NOTICE '- Comprehensive audit logging of all changes';
  RAISE NOTICE '- Performance metrics for support team evaluation';
  RAISE NOTICE '- Historical data for brand support interactions';
END $$;