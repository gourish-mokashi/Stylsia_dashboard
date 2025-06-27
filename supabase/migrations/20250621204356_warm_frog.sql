/*
  # Brand Authentication Validation Trigger
  
  This migration creates a trigger that validates brand IDs against the Authentication
  section before allowing insertions into the brands table. Only authenticated brands
  can be added to the brands table.
  
  1. Trigger Function
    - Validates that the brand_id exists in auth.users
    - Checks that the user has appropriate role (brand or admin)
    - Provides clear error messages for rejection cases
  
  2. Trigger
    - Fires BEFORE INSERT on brands table
    - Prevents insertion of non-authenticated brands
    - Allows admins to create brand records for authenticated users
*/

-- =============================================
-- 1. CREATE VALIDATION FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION validate_brand_authentication()
RETURNS TRIGGER AS $$
DECLARE
    auth_user_exists BOOLEAN;
    user_role TEXT;
    user_email TEXT;
    current_user_role TEXT;
BEGIN
    -- Check if the brand_id exists in auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE id = NEW.id
    ) INTO auth_user_exists;
    
    -- If brand_id doesn't exist in auth.users, reject the insertion
    IF NOT auth_user_exists THEN
        RAISE EXCEPTION 'Brand ID % does not exist in Authentication records. Only authenticated brands can be added to the brands table.', NEW.id
        USING HINT = 'Please ensure the brand is registered and authenticated before adding to the brands table.',
              ERRCODE = 'foreign_key_violation';
    END IF;
    
    -- Get user information from auth.users
    SELECT 
        (raw_user_meta_data->>'role')::TEXT,
        email
    INTO user_role, user_email
    FROM auth.users 
    WHERE id = NEW.id;
    
    -- Get current authenticated user's role (if any)
    SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' INTO current_user_role;
    
    -- Log the validation attempt
    RAISE NOTICE 'Validating brand authentication for ID: %, Email: %, Role: %', NEW.id, user_email, COALESCE(user_role, 'none');
    
    -- Validate that the user has an appropriate role
    -- Allow if:
    -- 1. User has 'brand' role, OR
    -- 2. User has 'admin' role, OR  
    -- 3. Current user is an admin (can create brand records for others)
    IF user_role NOT IN ('brand', 'admin') AND current_user_role != 'admin' THEN
        RAISE EXCEPTION 'User % (%) does not have appropriate role for brand registration. Current role: %. Only users with "brand" or "admin" roles can be added to the brands table.', 
            user_email, NEW.id, COALESCE(user_role, 'none')
        USING HINT = 'Please ensure the user has the correct role assigned in their authentication metadata.',
              ERRCODE = 'insufficient_privilege';
    END IF;
    
    -- If we get here, validation passed
    RAISE NOTICE 'Brand authentication validation passed for: % (%)', user_email, NEW.id;
    
    -- Auto-populate email if not provided and available from auth
    IF NEW.contact_email IS NULL AND user_email IS NOT NULL THEN
        NEW.contact_email = user_email;
        RAISE NOTICE 'Auto-populated contact_email from auth.users: %', user_email;
    END IF;
    
    -- Return the NEW record to allow the insertion
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. CREATE TRIGGER
-- =============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_brand_auth_trigger ON brands;

-- Create the trigger
CREATE TRIGGER validate_brand_auth_trigger
    BEFORE INSERT ON brands
    FOR EACH ROW
    EXECUTE FUNCTION validate_brand_authentication();

-- =============================================
-- 3. CREATE HELPER FUNCTION FOR SAFE BRAND CREATION
-- =============================================

-- Function to safely create a brand record with validation
CREATE OR REPLACE FUNCTION create_authenticated_brand(
    brand_user_id UUID,
    brand_name TEXT,
    brand_website TEXT DEFAULT NULL,
    brand_logo_url TEXT DEFAULT NULL,
    brand_description TEXT DEFAULT NULL,
    brand_contact_phone TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_brand_id UUID;
    auth_user_exists BOOLEAN;
    user_email TEXT;
    user_role TEXT;
BEGIN
    -- Validate that the user exists in auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE id = brand_user_id
    ) INTO auth_user_exists;
    
    IF NOT auth_user_exists THEN
        RAISE EXCEPTION 'User ID % does not exist in Authentication records', brand_user_id
        USING HINT = 'Please ensure the user is registered and authenticated first.';
    END IF;
    
    -- Get user details
    SELECT 
        email,
        (raw_user_meta_data->>'role')::TEXT
    INTO user_email, user_role
    FROM auth.users 
    WHERE id = brand_user_id;
    
    -- Validate role
    IF user_role NOT IN ('brand', 'admin') THEN
        RAISE EXCEPTION 'User % does not have appropriate role (%) for brand creation', user_email, COALESCE(user_role, 'none')
        USING HINT = 'User must have "brand" or "admin" role.';
    END IF;
    
    -- Create the brand record
    INSERT INTO brands (
        id,
        name,
        website,
        logo_url,
        description,
        contact_email,
        contact_phone,
        status
    ) VALUES (
        brand_user_id,
        brand_name,
        brand_website,
        brand_logo_url,
        brand_description,
        COALESCE(user_email, ''),
        brand_contact_phone,
        'active'
    ) RETURNING id INTO new_brand_id;
    
    RAISE NOTICE 'Successfully created brand record for authenticated user: % (%)', user_email, new_brand_id;
    
    RETURN new_brand_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. CREATE FUNCTION TO CHECK BRAND ELIGIBILITY
-- =============================================

-- Function to check if a user is eligible to be a brand
CREATE OR REPLACE FUNCTION check_brand_eligibility(user_id UUID)
RETURNS TABLE (
    eligible BOOLEAN,
    reason TEXT,
    user_email TEXT,
    user_role TEXT,
    already_brand BOOLEAN
) AS $$
DECLARE
    auth_exists BOOLEAN;
    user_email_val TEXT;
    user_role_val TEXT;
    brand_exists BOOLEAN;
BEGIN
    -- Check if user exists in auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE id = user_id
    ) INTO auth_exists;
    
    IF NOT auth_exists THEN
        RETURN QUERY SELECT 
            FALSE as eligible,
            'User does not exist in Authentication records' as reason,
            NULL::TEXT as user_email,
            NULL::TEXT as user_role,
            FALSE as already_brand;
        RETURN;
    END IF;
    
    -- Get user details
    SELECT 
        email,
        (raw_user_meta_data->>'role')::TEXT
    INTO user_email_val, user_role_val
    FROM auth.users 
    WHERE id = user_id;
    
    -- Check if already a brand
    SELECT EXISTS (
        SELECT 1 FROM brands WHERE id = user_id
    ) INTO brand_exists;
    
    -- Determine eligibility
    IF brand_exists THEN
        RETURN QUERY SELECT 
            FALSE as eligible,
            'User is already registered as a brand' as reason,
            user_email_val as user_email,
            user_role_val as user_role,
            TRUE as already_brand;
    ELSIF user_role_val NOT IN ('brand', 'admin') THEN
        RETURN QUERY SELECT 
            FALSE as eligible,
            format('User role "%s" is not eligible. Must be "brand" or "admin"', COALESCE(user_role_val, 'none')) as reason,
            user_email_val as user_email,
            user_role_val as user_role,
            FALSE as already_brand;
    ELSE
        RETURN QUERY SELECT 
            TRUE as eligible,
            'User is eligible to be registered as a brand' as reason,
            user_email_val as user_email,
            user_role_val as user_role,
            FALSE as already_brand;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. UPDATE EXISTING POLICIES
-- =============================================

-- Enable RLS on brands table if not already enabled
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public can view active brands" ON brands;
DROP POLICY IF EXISTS "Brands can manage own records" ON brands;
DROP POLICY IF EXISTS "Admins can manage all brands" ON brands;

-- Create comprehensive policies
CREATE POLICY "Public can view active brands" ON brands
    FOR SELECT 
    USING (status = 'active');

CREATE POLICY "Brands can read own records" ON brands
    FOR SELECT 
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = id
    );

CREATE POLICY "Brands can update own records" ON brands
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = id
    );

CREATE POLICY "Admins can manage all brands" ON brands
    FOR ALL 
    USING (
        auth.role() = 'authenticated' 
        AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    );

CREATE POLICY "Authenticated users can create brand records" ON brands
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND (
            -- User can create their own brand record
            auth.uid() = id 
            OR 
            -- Admins can create brand records for others
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
        )
    );

-- =============================================
-- 6. TESTING AND VERIFICATION
-- =============================================

-- Test the validation function with sample scenarios
DO $$
DECLARE
    test_user_id UUID;
    test_result RECORD;
BEGIN
    RAISE NOTICE '=== TESTING BRAND AUTHENTICATION VALIDATION ===';
    
    -- Test 1: Check eligibility for existing admin user
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE (raw_user_meta_data->>'role')::TEXT = 'admin' 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        SELECT * INTO test_result 
        FROM check_brand_eligibility(test_user_id);
        
        RAISE NOTICE 'Test 1 - Admin user eligibility:';
        RAISE NOTICE '  Eligible: %, Reason: %', test_result.eligible, test_result.reason;
        RAISE NOTICE '  Email: %, Role: %', test_result.user_email, test_result.user_role;
    ELSE
        RAISE NOTICE 'Test 1 - No admin user found for testing';
    END IF;
    
    -- Test 2: Check eligibility for existing brand user
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE (raw_user_meta_data->>'role')::TEXT = 'brand' 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        SELECT * INTO test_result 
        FROM check_brand_eligibility(test_user_id);
        
        RAISE NOTICE 'Test 2 - Brand user eligibility:';
        RAISE NOTICE '  Eligible: %, Reason: %', test_result.eligible, test_result.reason;
        RAISE NOTICE '  Email: %, Role: %', test_result.user_email, test_result.user_role;
    ELSE
        RAISE NOTICE 'Test 2 - No brand user found for testing';
    END IF;
    
    -- Test 3: Check eligibility for non-existent user
    test_user_id := '99999999-9999-9999-9999-999999999999'::UUID;
    SELECT * INTO test_result 
    FROM check_brand_eligibility(test_user_id);
    
    RAISE NOTICE 'Test 3 - Non-existent user eligibility:';
    RAISE NOTICE '  Eligible: %, Reason: %', test_result.eligible, test_result.reason;
    
END $$;

-- =============================================
-- 7. GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION create_authenticated_brand(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_brand_eligibility(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_brand_authentication() TO authenticated;

-- =============================================
-- 8. FINAL VERIFICATION
-- =============================================

-- Verify trigger was created successfully
DO $$
DECLARE
    trigger_exists BOOLEAN;
    function_exists BOOLEAN;
BEGIN
    -- Check if trigger exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE trigger_name = 'validate_brand_auth_trigger'
          AND event_object_table = 'brands'
    ) INTO trigger_exists;
    
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.routines 
        WHERE routine_name = 'validate_brand_authentication'
          AND routine_type = 'FUNCTION'
    ) INTO function_exists;
    
    RAISE NOTICE '=== TRIGGER SETUP VERIFICATION ===';
    RAISE NOTICE 'Validation function exists: %', function_exists;
    RAISE NOTICE 'Validation trigger exists: %', trigger_exists;
    
    IF trigger_exists AND function_exists THEN
        RAISE NOTICE 'SUCCESS: Brand authentication validation is now active!';
        RAISE NOTICE 'Only authenticated users with "brand" or "admin" roles can be added to the brands table.';
        RAISE NOTICE 'Use create_authenticated_brand() function for safe brand creation.';
        RAISE NOTICE 'Use check_brand_eligibility() function to verify user eligibility before creation.';
    ELSE
        RAISE WARNING 'WARNING: Trigger setup may not have completed successfully.';
    END IF;
END $$;

-- Show usage examples
DO $$
BEGIN
    RAISE NOTICE '=== USAGE EXAMPLES ===';
    RAISE NOTICE 'To check if a user can be a brand:';
    RAISE NOTICE '  SELECT * FROM check_brand_eligibility(''user-uuid-here'');';
    RAISE NOTICE '';
    RAISE NOTICE 'To safely create a brand record:';
    RAISE NOTICE '  SELECT create_authenticated_brand(';
    RAISE NOTICE '    ''user-uuid-here'',';
    RAISE NOTICE '    ''Brand Name'',';
    RAISE NOTICE '    ''https://website.com'',';
    RAISE NOTICE '    ''https://logo-url.com'',';
    RAISE NOTICE '    ''Brand description'',';
    RAISE NOTICE '    ''+1-555-0123''';
    RAISE NOTICE '  );';
    RAISE NOTICE '';
    RAISE NOTICE 'Direct INSERT will now validate automatically:';
    RAISE NOTICE '  INSERT INTO brands (id, name) VALUES (''user-uuid'', ''Brand Name'');';
END $$;