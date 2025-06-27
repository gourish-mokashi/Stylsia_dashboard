-- =============================================
-- SUPPORT REQUESTS - BRAND FOREIGN KEY MIGRATION
-- =============================================
-- This migration establishes a proper foreign key relationship between
-- support_requests.brand_id and brands.id with data integrity handling

-- =============================================
-- 1. ANALYZE EXISTING DATA
-- =============================================

-- Check current state of support_requests table
DO $$
DECLARE
    total_requests INTEGER;
    null_brand_ids INTEGER;
    unique_brand_ids INTEGER;
    existing_brands INTEGER;
BEGIN
    -- Count total support requests
    SELECT COUNT(*) INTO total_requests FROM support_requests;
    
    -- Count null brand_ids
    SELECT COUNT(*) INTO null_brand_ids FROM support_requests WHERE brand_id IS NULL;
    
    -- Count unique brand_ids
    SELECT COUNT(DISTINCT brand_id) INTO unique_brand_ids FROM support_requests WHERE brand_id IS NOT NULL;
    
    -- Count existing brands
    SELECT COUNT(*) INTO existing_brands FROM brands;
    
    RAISE NOTICE 'Support Requests Analysis:';
    RAISE NOTICE '- Total support requests: %', total_requests;
    RAISE NOTICE '- Requests with null brand_id: %', null_brand_ids;
    RAISE NOTICE '- Unique brand_ids in requests: %', unique_brand_ids;
    RAISE NOTICE '- Existing brands in brands table: %', existing_brands;
END $$;

-- =============================================
-- 2. CREATE MISSING BRAND RECORDS
-- =============================================

-- Create brand records for any brand_ids that exist in support_requests but not in brands
INSERT INTO brands (id, name, status, created_at, updated_at)
SELECT DISTINCT 
    sr.brand_id,
    'Brand ' || SUBSTRING(sr.brand_id::TEXT, 1, 8) as name,
    'active' as status,
    NOW() as created_at,
    NOW() as updated_at
FROM support_requests sr
WHERE sr.brand_id IS NOT NULL 
  AND sr.brand_id NOT IN (SELECT id FROM brands WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 3. HANDLE NULL BRAND_ID VALUES
-- =============================================

-- Create a default brand for orphaned requests
INSERT INTO brands (id, name, status, description, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Unknown Brand',
    'inactive',
    'Default brand for support requests without valid brand association',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Update null brand_id values to point to the default brand
UPDATE support_requests 
SET brand_id = '00000000-0000-0000-0000-000000000000'::UUID
WHERE brand_id IS NULL;

-- =============================================
-- 4. VERIFY DATA INTEGRITY
-- =============================================

-- Check that all brand_ids in support_requests now exist in brands table
DO $$
DECLARE
    orphaned_requests INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_requests
    FROM support_requests sr
    LEFT JOIN brands b ON sr.brand_id = b.id
    WHERE b.id IS NULL;
    
    IF orphaned_requests > 0 THEN
        RAISE EXCEPTION 'Found % orphaned support requests that cannot be linked to brands', orphaned_requests;
    ELSE
        RAISE NOTICE 'All support requests have valid brand references';
    END IF;
END $$;

-- =============================================
-- 5. SAFELY ADD FOREIGN KEY CONSTRAINT
-- =============================================

-- Check if foreign key constraint already exists and handle accordingly
DO $$
DECLARE
    fk_exists BOOLEAN;
    fk_constraint_name TEXT := 'support_requests_brand_id_fkey';
BEGIN
    -- Check if the foreign key constraint already exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        WHERE tc.table_name = 'support_requests'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND tc.constraint_name = fk_constraint_name
    ) INTO fk_exists;
    
    IF fk_exists THEN
        RAISE NOTICE 'Foreign key constraint % already exists, dropping and recreating...', fk_constraint_name;
        
        -- Drop existing constraint
        EXECUTE format('ALTER TABLE support_requests DROP CONSTRAINT %I', fk_constraint_name);
        
        RAISE NOTICE 'Existing foreign key constraint dropped successfully';
    ELSE
        RAISE NOTICE 'No existing foreign key constraint found, creating new one...';
    END IF;
    
    -- Ensure brand_id column is NOT NULL
    ALTER TABLE support_requests 
    ALTER COLUMN brand_id SET NOT NULL;
    
    -- Add the foreign key constraint with CASCADE DELETE
    EXECUTE format(
        'ALTER TABLE support_requests ADD CONSTRAINT %I FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE',
        fk_constraint_name
    );
    
    RAISE NOTICE 'Foreign key constraint % created successfully', fk_constraint_name;
END $$;

-- =============================================
-- 6. ADD PERFORMANCE INDEXES
-- =============================================

-- Create indexes for better query performance (IF NOT EXISTS to avoid conflicts)
CREATE INDEX IF NOT EXISTS idx_support_requests_brand_id 
ON support_requests(brand_id);

CREATE INDEX IF NOT EXISTS idx_support_requests_status 
ON support_requests(status);

CREATE INDEX IF NOT EXISTS idx_support_requests_created_at 
ON support_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_requests_brand_status 
ON support_requests(brand_id, status);

-- =============================================
-- 7. UPDATE ROW LEVEL SECURITY POLICIES
-- =============================================

-- Safely drop existing policies (IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "brands_read_own_support_requests" ON support_requests;
DROP POLICY IF EXISTS "brands_create_own_support_requests" ON support_requests;
DROP POLICY IF EXISTS "admins_read_all_support_requests" ON support_requests;
DROP POLICY IF EXISTS "admins_update_support_requests" ON support_requests;

-- Create updated policies that work with the new foreign key relationship
CREATE POLICY "brands_read_own_support_requests" ON support_requests
    FOR SELECT 
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = brand_id
    );

CREATE POLICY "brands_create_own_support_requests" ON support_requests
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = brand_id
    );

CREATE POLICY "admins_read_all_support_requests" ON support_requests
    FOR SELECT 
    USING (
        auth.role() = 'authenticated' 
        AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    );

CREATE POLICY "admins_update_support_requests" ON support_requests
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' 
        AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    );

-- =============================================
-- 8. CREATE HELPER FUNCTIONS
-- =============================================

-- Function to get support requests with brand information
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
        sr.created_at,
        sr.updated_at,
        sr.resolved_at
    FROM support_requests sr
    JOIN brands b ON sr.brand_id = b.id
    ORDER BY sr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get brand support request statistics
CREATE OR REPLACE FUNCTION get_brand_support_stats(brand_uuid UUID)
RETURNS TABLE (
    brand_id UUID,
    brand_name TEXT,
    total_requests INTEGER,
    new_requests INTEGER,
    in_progress_requests INTEGER,
    resolved_requests INTEGER,
    closed_requests INTEGER,
    avg_resolution_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as brand_id,
        b.name as brand_name,
        COUNT(sr.id)::INTEGER as total_requests,
        COUNT(CASE WHEN sr.status = 'new' THEN 1 END)::INTEGER as new_requests,
        COUNT(CASE WHEN sr.status = 'in_progress' THEN 1 END)::INTEGER as in_progress_requests,
        COUNT(CASE WHEN sr.status = 'resolved' THEN 1 END)::INTEGER as resolved_requests,
        COUNT(CASE WHEN sr.status = 'closed' THEN 1 END)::INTEGER as closed_requests,
        AVG(
            CASE 
                WHEN sr.resolved_at IS NOT NULL 
                THEN sr.resolved_at - sr.created_at 
                ELSE NULL 
            END
        ) as avg_resolution_time
    FROM brands b
    LEFT JOIN support_requests sr ON b.id = sr.brand_id
    WHERE b.id = brand_uuid
    GROUP BY b.id, b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. VERIFICATION AND TESTING
-- =============================================

-- Verify the foreign key constraint was created properly
DO $$
DECLARE
    fk_exists BOOLEAN;
    fk_constraint_name TEXT := 'support_requests_brand_id_fkey';
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'support_requests'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'brand_id'
          AND tc.constraint_name = fk_constraint_name
    ) INTO fk_exists;
    
    IF fk_exists THEN
        RAISE NOTICE 'Foreign key constraint % successfully verified!', fk_constraint_name;
    ELSE
        RAISE EXCEPTION 'Foreign key constraint % was not created properly', fk_constraint_name;
    END IF;
END $$;

-- Test the relationship by showing sample data
DO $$
DECLARE
    brand_count INTEGER;
    request_count INTEGER;
    sample_brand RECORD;
BEGIN
    SELECT COUNT(*) INTO brand_count FROM brands;
    SELECT COUNT(*) INTO request_count FROM support_requests;
    
    RAISE NOTICE 'Relationship test results:';
    RAISE NOTICE '- Total brands: %', brand_count;
    RAISE NOTICE '- Total support requests: %', request_count;
    
    -- Show sample brand-request relationships
    RAISE NOTICE 'Sample brand-request relationships:';
    FOR sample_brand IN 
        SELECT 
            b.name as brand_name,
            COUNT(sr.id) as request_count
        FROM brands b
        LEFT JOIN support_requests sr ON b.id = sr.brand_id
        GROUP BY b.id, b.name
        ORDER BY COUNT(sr.id) DESC
        LIMIT 5
    LOOP
        RAISE NOTICE '- Brand: %, Requests: %', sample_brand.brand_name, sample_brand.request_count;
    END LOOP;
END $$;

-- =============================================
-- 10. FINAL VERIFICATION
-- =============================================

-- Final status report
DO $$
DECLARE
    total_brands INTEGER;
    total_requests INTEGER;
    requests_with_brands INTEGER;
    fk_constraint_exists BOOLEAN;
    indexes_created INTEGER;
    final_constraint_name TEXT := 'support_requests_brand_id_fkey';
BEGIN
    SELECT COUNT(*) INTO total_brands FROM brands;
    SELECT COUNT(*) INTO total_requests FROM support_requests;
    SELECT COUNT(*) INTO requests_with_brands 
    FROM support_requests sr 
    JOIN brands b ON sr.brand_id = b.id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.table_name = 'support_requests' 
          AND tc.constraint_type = 'FOREIGN KEY'
          AND tc.constraint_name = final_constraint_name
    ) INTO fk_constraint_exists;
    
    SELECT COUNT(*) INTO indexes_created
    FROM pg_indexes 
    WHERE tablename = 'support_requests' 
      AND indexname LIKE 'idx_support_requests_%';
    
    RAISE NOTICE '=== MIGRATION COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Total brands: %', total_brands;
    RAISE NOTICE 'Total support requests: %', total_requests;
    RAISE NOTICE 'Support requests with valid brand references: %', requests_with_brands;
    RAISE NOTICE 'Foreign key constraint exists: %', fk_constraint_exists;
    RAISE NOTICE 'Performance indexes created: %', indexes_created;
    
    IF requests_with_brands = total_requests AND fk_constraint_exists THEN
        RAISE NOTICE 'SUCCESS: All support requests are properly linked to brands!';
        RAISE NOTICE 'The foreign key relationship has been established successfully.';
        RAISE NOTICE 'Data integrity is maintained with CASCADE DELETE rules.';
    ELSE
        RAISE WARNING 'WARNING: Some issues may exist with the brand-support request relationship';
        RAISE NOTICE 'Please check the data manually if needed.';
    END IF;
END $$;