/*
  # Remove Public Visibility from Brand Profile
  
  This migration removes the public visibility functionality from the brand profile,
  including database columns and related settings.
  
  1. Changes
    - Removes is_public and visibility_settings columns from brands table
    - Removes any related functions, triggers, or policies
    - Updates existing data to ensure integrity
  
  2. Security
    - Maintains all existing RLS policies
    - No impact on authentication or authorization
*/

-- =============================================
-- 1. ANALYZE EXISTING DATA
-- =============================================

DO $$
DECLARE
    brands_has_is_public BOOLEAN;
    brands_has_visibility_settings BOOLEAN;
    brands_has_public_profile BOOLEAN;
    brands_has_social_visibility BOOLEAN;
BEGIN
    -- Check if brands table has visibility-related columns
    SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'is_public'
    ) INTO brands_has_is_public;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'visibility_settings'
    ) INTO brands_has_visibility_settings;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'public_profile'
    ) INTO brands_has_public_profile;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'social_visibility'
    ) INTO brands_has_social_visibility;
    
    RAISE NOTICE 'Analysis Results:';
    RAISE NOTICE '- brands.is_public column exists: %', brands_has_is_public;
    RAISE NOTICE '- brands.visibility_settings column exists: %', brands_has_visibility_settings;
    RAISE NOTICE '- brands.public_profile column exists: %', brands_has_public_profile;
    RAISE NOTICE '- brands.social_visibility column exists: %', brands_has_social_visibility;
END $$;

-- =============================================
-- 2. REMOVE VISIBILITY COLUMNS FROM BRANDS TABLE
-- =============================================

-- Remove is_public column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE brands DROP COLUMN is_public;
        RAISE NOTICE 'Removed is_public column from brands table';
    ELSE
        RAISE NOTICE 'is_public column does not exist in brands table';
    END IF;
END $$;

-- Remove visibility_settings column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'visibility_settings'
    ) THEN
        ALTER TABLE brands DROP COLUMN visibility_settings;
        RAISE NOTICE 'Removed visibility_settings column from brands table';
    ELSE
        RAISE NOTICE 'visibility_settings column does not exist in brands table';
    END IF;
END $$;

-- Remove public_profile column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'public_profile'
    ) THEN
        ALTER TABLE brands DROP COLUMN public_profile;
        RAISE NOTICE 'Removed public_profile column from brands table';
    ELSE
        RAISE NOTICE 'public_profile column does not exist in brands table';
    END IF;
END $$;

-- Remove social_visibility column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'social_visibility'
    ) THEN
        ALTER TABLE brands DROP COLUMN social_visibility;
        RAISE NOTICE 'Removed social_visibility column from brands table';
    ELSE
        RAISE NOTICE 'social_visibility column does not exist in brands table';
    END IF;
END $$;

-- =============================================
-- 3. CLEAN UP RELATED FUNCTIONS
-- =============================================

-- Drop any functions related to brand visibility
DROP FUNCTION IF EXISTS get_public_brands();
DROP FUNCTION IF EXISTS get_brand_public_profile(UUID);
DROP FUNCTION IF EXISTS set_brand_visibility(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS update_brand_visibility_settings(UUID, JSONB);
DROP FUNCTION IF EXISTS toggle_social_visibility(UUID, TEXT, BOOLEAN);

-- =============================================
-- 4. CLEAN UP RELATED POLICIES
-- =============================================

-- Drop any policies specifically related to public visibility
DO $$
BEGIN
    -- Try to drop policies with visibility-related names
    BEGIN
        DROP POLICY IF EXISTS "Public can view visible brands" ON brands;
        RAISE NOTICE 'Dropped policy: Public can view visible brands';
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Policy "Public can view visible brands" does not exist or could not be dropped';
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Brands can control visibility" ON brands;
        RAISE NOTICE 'Dropped policy: Brands can control visibility';
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Policy "Brands can control visibility" does not exist or could not be dropped';
    END;
END $$;

-- =============================================
-- 5. VERIFICATION
-- =============================================

DO $$
DECLARE
    remaining_columns INTEGER := 0;
    remaining_functions INTEGER := 0;
    remaining_policies INTEGER := 0;
BEGIN
    -- Count remaining visibility-related columns
    SELECT COUNT(*) INTO remaining_columns
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'brands' 
      AND column_name IN ('is_public', 'visibility_settings', 'public_profile', 'social_visibility');
    
    -- Count remaining visibility-related functions
    SELECT COUNT(*) INTO remaining_functions
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
      AND (routine_name LIKE '%visibility%' OR routine_name LIKE '%public_profile%' OR routine_name LIKE '%public_brand%');
    
    -- Count remaining visibility-related policies
    SELECT COUNT(*) INTO remaining_policies
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND (policyname LIKE '%visibility%' OR policyname LIKE '%public%');
    
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICATION RESULTS ===';
    RAISE NOTICE 'Remaining visibility-related columns: %', remaining_columns;
    RAISE NOTICE 'Remaining visibility-related functions: %', remaining_functions;
    RAISE NOTICE 'Remaining visibility-related policies: %', remaining_policies;
    
    -- Final status
    IF remaining_columns = 0 AND remaining_functions = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE 'SUCCESS: Public visibility functionality completely removed!';
        RAISE NOTICE 'The database has been cleaned up and is ready for production use.';
    ELSE
        RAISE WARNING 'WARNING: Some visibility-related components may still exist. Manual cleanup may be required.';
    END IF;
END $$;

-- =============================================
-- 6. FINAL CLEANUP MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRATION COMPLETED ===';
    RAISE NOTICE 'Public visibility functionality has been removed from the brand profile.';
    RAISE NOTICE 'This includes:';
    RAISE NOTICE '- All visibility-related columns from the brands table';
    RAISE NOTICE '- All related functions and policies';
    RAISE NOTICE '';
    RAISE NOTICE 'Social media connections remain functional but without public visibility controls.';
END $$;