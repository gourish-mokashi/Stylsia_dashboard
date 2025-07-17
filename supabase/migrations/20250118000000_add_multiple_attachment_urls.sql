-- =============================================
-- SUPPORT REQUESTS - MULTIPLE ATTACHMENT URLS
-- =============================================
-- This migration adds support for multiple attachment URLs in support requests
-- by adding a new attachment_urls JSON array field while maintaining backward compatibility

-- =============================================
-- 1. ADD NEW ATTACHMENT_URLS COLUMN
-- =============================================

-- Add the new attachment_urls column as a JSON array
ALTER TABLE support_requests 
ADD COLUMN IF NOT EXISTS attachment_urls JSONB DEFAULT NULL;

-- =============================================
-- 2. MIGRATE EXISTING DATA
-- =============================================

-- Convert existing single attachment_url to attachment_urls array
UPDATE support_requests 
SET attachment_urls = CASE 
    WHEN attachment_url IS NOT NULL AND attachment_url != '' THEN 
        jsonb_build_array(attachment_url)
    ELSE 
        NULL
END
WHERE attachment_urls IS NULL;

-- =============================================
-- 3. CREATE HELPER FUNCTIONS
-- =============================================

-- Function to add attachment URLs to a support request
CREATE OR REPLACE FUNCTION add_attachment_urls_to_request(
    request_id UUID,
    new_urls TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
    current_urls JSONB;
    updated_urls JSONB;
BEGIN
    -- Get current attachment URLs
    SELECT attachment_urls INTO current_urls
    FROM support_requests
    WHERE id = request_id;
    
    -- If no current URLs, create new array
    IF current_urls IS NULL THEN
        updated_urls = to_jsonb(new_urls);
    ELSE
        -- Merge existing URLs with new ones
        updated_urls = current_urls || to_jsonb(new_urls);
    END IF;
    
    -- Update the support request
    UPDATE support_requests
    SET 
        attachment_urls = updated_urls,
        has_attachment = (updated_urls IS NOT NULL AND jsonb_array_length(updated_urls) > 0),
        attachment_url = CASE 
            WHEN updated_urls IS NOT NULL AND jsonb_array_length(updated_urls) > 0 THEN
                updated_urls->>0  -- Store first URL for backward compatibility
            ELSE
                NULL
        END,
        updated_at = NOW()
    WHERE id = request_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove attachment URL from a support request
CREATE OR REPLACE FUNCTION remove_attachment_url_from_request(
    request_id UUID,
    url_to_remove TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_urls JSONB;
    updated_urls JSONB;
BEGIN
    -- Get current attachment URLs
    SELECT attachment_urls INTO current_urls
    FROM support_requests
    WHERE id = request_id;
    
    -- If no current URLs, nothing to remove
    IF current_urls IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Remove the URL from the array
    SELECT jsonb_agg(url)
    INTO updated_urls
    FROM jsonb_array_elements_text(current_urls) AS url
    WHERE url != url_to_remove;
    
    -- Update the support request
    UPDATE support_requests
    SET 
        attachment_urls = CASE 
            WHEN updated_urls IS NULL OR jsonb_array_length(updated_urls) = 0 THEN NULL
            ELSE updated_urls
        END,
        has_attachment = (updated_urls IS NOT NULL AND jsonb_array_length(updated_urls) > 0),
        attachment_url = CASE 
            WHEN updated_urls IS NOT NULL AND jsonb_array_length(updated_urls) > 0 THEN
                updated_urls->>0  -- Store first URL for backward compatibility
            ELSE
                NULL
        END,
        updated_at = NOW()
    WHERE id = request_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. UPDATE EXISTING FUNCTIONS
-- =============================================

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS admin_get_all_support_requests();
DROP FUNCTION IF EXISTS get_support_requests_with_brand_info();
DROP FUNCTION IF EXISTS create_support_request(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS create_support_request(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT[]);

-- Also handle any other potential function signatures that might exist
DO $$
BEGIN
    -- Drop any existing create_support_request function variants
    DROP FUNCTION IF EXISTS create_support_request(UUID, TEXT, TEXT);
    DROP FUNCTION IF EXISTS create_support_request(UUID, TEXT, TEXT, TEXT);
    DROP FUNCTION IF EXISTS create_support_request(UUID, TEXT, TEXT, TEXT, BOOLEAN);
EXCEPTION
    WHEN undefined_function THEN
        -- Function doesn't exist, continue
        NULL;
END $$;

-- Update the admin_get_all_support_requests function to include attachment_urls
CREATE OR REPLACE FUNCTION admin_get_all_support_requests()
RETURNS TABLE (
    id UUID,
    brand_id UUID,
    subject TEXT,
    description TEXT,
    priority TEXT,
    status TEXT,
    has_attachment BOOLEAN,
    attachment_url TEXT,
    attachment_urls JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    brand_name TEXT,
    brand_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id,
        sr.brand_id,
        sr.subject,
        sr.description,
        sr.priority,
        sr.status,
        sr.has_attachment,
        sr.attachment_url,
        sr.attachment_urls,
        sr.created_at,
        sr.updated_at,
        sr.resolved_at,
        COALESCE(b.name, 'Unknown Brand') as brand_name,
        COALESCE(b.contact_email, 'unknown@example.com') as brand_email
    FROM support_requests sr
    LEFT JOIN brands b ON sr.brand_id = b.id
    ORDER BY sr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the get_support_requests_with_brand_info function to include attachment_urls
CREATE OR REPLACE FUNCTION get_support_requests_with_brand_info()
RETURNS TABLE (
    request_id UUID,
    brand_id UUID,
    brand_name TEXT,
    brand_email TEXT,
    subject TEXT,
    description TEXT,
    priority TEXT,
    status TEXT,
    has_attachment BOOLEAN,
    attachment_url TEXT,
    attachment_urls JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id as request_id,
        sr.brand_id,
        b.name as brand_name,
        b.contact_email as brand_email,
        sr.subject,
        sr.description,
        sr.priority,
        sr.status,
        sr.has_attachment,
        sr.attachment_url,
        sr.attachment_urls,
        sr.created_at,
        sr.updated_at,
        sr.resolved_at
    FROM support_requests sr
    JOIN brands b ON sr.brand_id = b.id
    ORDER BY sr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the create_support_request function to support multiple URLs
-- Note: This replaces the existing function with a new signature
CREATE OR REPLACE FUNCTION create_support_request(
    brand_uuid UUID,
    subject_text TEXT,
    description_text TEXT,
    priority_level TEXT DEFAULT 'medium',
    has_attachment_flag BOOLEAN DEFAULT FALSE,
    attachment_url_text TEXT DEFAULT NULL,
    attachment_urls_array TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
    final_urls JSONB;
BEGIN
    -- Validate priority level
    IF priority_level NOT IN ('low', 'medium', 'high') THEN
        RAISE EXCEPTION 'Invalid priority level: %. Must be low, medium, or high.', priority_level;
    END IF;
    
    -- Validate brand exists
    IF NOT EXISTS (SELECT 1 FROM brands WHERE id = brand_uuid) THEN
        RAISE EXCEPTION 'Brand with ID % does not exist', brand_uuid;
    END IF;
    
    -- Prepare attachment URLs
    IF attachment_urls_array IS NOT NULL AND array_length(attachment_urls_array, 1) > 0 THEN
        final_urls = to_jsonb(attachment_urls_array);
    ELSIF attachment_url_text IS NOT NULL AND attachment_url_text != '' THEN
        final_urls = jsonb_build_array(attachment_url_text);
    ELSE
        final_urls = NULL;
    END IF;
    
    -- Create the support request
    INSERT INTO support_requests (
        brand_id,
        subject,
        description,
        priority,
        status,
        has_attachment,
        attachment_url,
        attachment_urls
    ) VALUES (
        brand_uuid,
        subject_text,
        description_text,
        priority_level,
        'new',
        has_attachment_flag,
        CASE 
            WHEN final_urls IS NOT NULL AND jsonb_array_length(final_urls) > 0 THEN
                final_urls->>0  -- Store first URL for backward compatibility
            ELSE
                NULL
        END,
        final_urls
    ) RETURNING id INTO request_id;
    
    -- Record audit event
    PERFORM record_audit_event(
        brand_uuid,
        'INSERT',
        'support_requests',
        request_id::TEXT,
        jsonb_build_object(
            'subject', subject_text,
            'priority', priority_level,
            'has_attachment', has_attachment_flag,
            'attachment_count', COALESCE(jsonb_array_length(final_urls), 0)
        )
    );
    
    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions for the new functions
GRANT EXECUTE ON FUNCTION add_attachment_urls_to_request(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_attachment_url_from_request(UUID, TEXT) TO authenticated;

-- =============================================
-- 6. CREATE INDEX FOR PERFORMANCE
-- =============================================

-- Create GIN index for efficient querying of attachment_urls JSONB array
CREATE INDEX IF NOT EXISTS idx_support_requests_attachment_urls 
ON support_requests USING GIN (attachment_urls);

-- =============================================
-- 7. VERIFY MIGRATION
-- =============================================

DO $$
DECLARE
    total_requests INTEGER;
    requests_with_single_url INTEGER;
    requests_with_multiple_urls INTEGER;
    column_exists BOOLEAN;
BEGIN
    -- Check if the column was added successfully
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'support_requests' 
        AND column_name = 'attachment_urls'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        RAISE EXCEPTION 'attachment_urls column was not created successfully';
    END IF;
    
    -- Count support requests
    SELECT COUNT(*) INTO total_requests FROM support_requests;
    
    -- Count requests with single attachment URL
    SELECT COUNT(*) INTO requests_with_single_url 
    FROM support_requests 
    WHERE attachment_url IS NOT NULL;
    
    -- Count requests with multiple attachment URLs
    SELECT COUNT(*) INTO requests_with_multiple_urls 
    FROM support_requests 
    WHERE attachment_urls IS NOT NULL AND jsonb_array_length(attachment_urls) > 1;
    
    RAISE NOTICE '=== MULTIPLE ATTACHMENT URLS MIGRATION COMPLETED ===';
    RAISE NOTICE 'Total support requests: %', total_requests;
    RAISE NOTICE 'Requests with single attachment URL: %', requests_with_single_url;
    RAISE NOTICE 'Requests with multiple attachment URLs: %', requests_with_multiple_urls;
    RAISE NOTICE 'attachment_urls column created successfully';
    RAISE NOTICE 'Helper functions created and permissions granted';
    RAISE NOTICE 'Migration completed successfully!';
END $$;
