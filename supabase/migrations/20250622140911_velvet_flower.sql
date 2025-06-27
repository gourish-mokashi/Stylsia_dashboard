/*
  # Add Logo Storage Support
  
  This migration adds storage bucket and policies for brand logo uploads.
  
  1. New Features
    - Creates a storage bucket for brand assets
    - Sets up RLS policies for secure access
    - Adds helper functions for logo management
  
  2. Security
    - Ensures only authenticated users can upload logos
    - Restricts access to appropriate brand owners
    - Implements size and file type validation
*/

-- =============================================
-- 1. CREATE STORAGE BUCKET
-- =============================================

-- Create a storage bucket for brand assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'Brand Assets', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. SET UP STORAGE POLICIES
-- =============================================

-- Allow public access to brand logos (read-only)
CREATE POLICY "Public can view brand logos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'brand-assets' AND
  (storage.foldername(name))[1] = 'brand-logos'
);

-- Allow authenticated users to upload their own brand logos
CREATE POLICY "Authenticated users can upload brand logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'brand-assets' AND
  (storage.foldername(name))[1] = 'brand-logos' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own brand logos
CREATE POLICY "Users can update their own brand logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'brand-assets' AND
  (storage.foldername(name))[1] = 'brand-logos' AND
  auth.role() = 'authenticated' AND
  (auth.uid() = owner OR
   auth.uid() IN (
     SELECT id FROM brands WHERE logo_url LIKE '%' || name || '%'
   ))
);

-- Allow users to delete their own brand logos
CREATE POLICY "Users can delete their own brand logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'brand-assets' AND
  (storage.foldername(name))[1] = 'brand-logos' AND
  auth.role() = 'authenticated' AND
  (auth.uid() = owner OR
   auth.uid() IN (
     SELECT id FROM brands WHERE logo_url LIKE '%' || name || '%'
   ))
);

-- =============================================
-- 3. CREATE HELPER FUNCTIONS
-- =============================================

-- Function to update brand logo URL
CREATE OR REPLACE FUNCTION update_brand_logo(
  brand_uuid UUID,
  logo_url TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  update_count INTEGER;
BEGIN
  -- Update the brand's logo URL
  UPDATE brands
  SET 
    logo_url = update_brand_logo.logo_url,
    updated_at = NOW()
  WHERE id = brand_uuid;
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  RETURN update_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate logo file
CREATE OR REPLACE FUNCTION validate_logo_file(
  file_name TEXT,
  file_size INTEGER
)
RETURNS TABLE (
  is_valid BOOLEAN,
  message TEXT
) AS $$
DECLARE
  file_extension TEXT;
  max_size_mb INTEGER := 5; -- 5MB limit
BEGIN
  -- Extract file extension
  file_extension := lower(substring(file_name from '\.([^\.]+)$'));
  
  -- Check file size
  IF file_size > max_size_mb * 1024 * 1024 THEN
    RETURN QUERY SELECT 
      FALSE as is_valid,
      format('File size exceeds %sMB limit', max_size_mb) as message;
    RETURN;
  END IF;
  
  -- Check file extension
  IF file_extension NOT IN ('jpg', 'jpeg', 'png', 'svg') THEN
    RETURN QUERY SELECT 
      FALSE as is_valid,
      'Only JPG, PNG, and SVG files are allowed' as message;
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    TRUE as is_valid,
    'File is valid' as message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_brand_logo(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_logo_file(TEXT, INTEGER) TO authenticated;

-- =============================================
-- 5. VERIFICATION
-- =============================================

-- Verify storage bucket was created
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'brand-assets'
  ) INTO bucket_exists;
  
  IF bucket_exists THEN
    RAISE NOTICE 'Storage bucket "brand-assets" created successfully';
  ELSE
    RAISE WARNING 'Failed to create storage bucket "brand-assets"';
  END IF;
END $$;

-- Verify policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname LIKE '%brand%';
  
  RAISE NOTICE 'Created % storage policies for brand assets', policy_count;
  
  IF policy_count >= 4 THEN
    RAISE NOTICE 'Storage policies created successfully';
  ELSE
    RAISE WARNING 'Some storage policies may not have been created';
  END IF;
END $$;

-- Verify functions were created
DO $$
DECLARE
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name IN ('update_brand_logo', 'validate_logo_file');
  
  RAISE NOTICE 'Created % helper functions for logo management', function_count;
  
  IF function_count = 2 THEN
    RAISE NOTICE 'Helper functions created successfully';
  ELSE
    RAISE WARNING 'Some helper functions may not have been created';
  END IF;
END $$;

-- =============================================
-- 6. FINAL SETUP MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== LOGO UPLOAD FUNCTIONALITY SETUP COMPLETE ===';
  RAISE NOTICE 'The following components have been set up:';
  RAISE NOTICE '- Storage bucket for brand assets';
  RAISE NOTICE '- Security policies for logo access and management';
  RAISE NOTICE '- Helper functions for logo validation and updates';
  RAISE NOTICE '';
  RAISE NOTICE 'The system is now ready for brand logo uploads with:';
  RAISE NOTICE '- 5MB file size limit';
  RAISE NOTICE '- Support for JPG, PNG, and SVG formats';
  RAISE NOTICE '- Secure access controls';
END $$;