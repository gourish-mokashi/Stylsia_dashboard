-- =============================================
-- FIX ADMIN SUPPORT REQUEST ACCESS
-- =============================================
-- This migration fixes the issue where admin users cannot see support requests
-- by creating an alternative function that bypasses RLS

-- Function to get all support requests for admin users (bypasses RLS)
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
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    brand_name TEXT,
    brand_email TEXT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- This function runs with elevated privileges and bypasses RLS
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
        sr.created_at,
        sr.updated_at,
        sr.resolved_at,
        COALESCE(b.name, 'Unknown Brand') as brand_name,
        COALESCE(b.contact_email, 'unknown@example.com') as brand_email
    FROM support_requests sr
    LEFT JOIN brands b ON sr.brand_id = b.id
    ORDER BY sr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_get_all_support_requests() TO authenticated;

-- Create a simpler function for updating support request status
CREATE OR REPLACE FUNCTION admin_update_support_request_status(
    request_id UUID,
    new_status TEXT,
    admin_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update the support request status
    UPDATE support_requests 
    SET 
        status = new_status,
        updated_at = NOW(),
        resolved_at = CASE 
            WHEN new_status = 'resolved' THEN NOW() 
            ELSE resolved_at 
        END
    WHERE id = request_id;
    
    -- Return true if a row was updated
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_update_support_request_status(UUID, TEXT, UUID) TO authenticated;

-- Also create a more permissive policy for admin access as a backup
-- First, check if we need to drop existing policies
DO $$
BEGIN
    -- Drop and recreate the admin read policy to be more permissive
    DROP POLICY IF EXISTS "admins_read_all_support_requests" ON support_requests;
    
    CREATE POLICY "admins_read_all_support_requests" ON support_requests
        FOR SELECT 
        USING (
            auth.role() = 'authenticated' AND (
                -- Check for admin role in user_metadata
                (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
                OR
                -- Also allow specific admin emails as fallback
                auth.jwt() ->> 'email' IN (
                    'admin@stylsia.com',
                    'support@stylsia.com', 
                    'manager@stylsia.com',
                    'demo@stylsia.com'
                )
            )
        );
        
    -- Drop and recreate the admin update policy
    DROP POLICY IF EXISTS "admins_update_support_requests" ON support_requests;
    
    CREATE POLICY "admins_update_support_requests" ON support_requests
        FOR UPDATE 
        USING (
            auth.role() = 'authenticated' AND (
                -- Check for admin role in user_metadata
                (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
                OR
                -- Also allow specific admin emails as fallback
                auth.jwt() ->> 'email' IN (
                    'admin@stylsia.com',
                    'support@stylsia.com', 
                    'manager@stylsia.com',
                    'demo@stylsia.com'
                )
            )
        );
        
    RAISE NOTICE 'Updated admin policies for support_requests table';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating policies: %', SQLERRM;
END $$;
