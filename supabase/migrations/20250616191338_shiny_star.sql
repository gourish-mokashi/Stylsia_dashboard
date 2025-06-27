-- =============================================
-- ADD ROLES TO EXISTING USERS
-- =============================================
-- Run this in Supabase SQL Editor to add roles to your existing users

-- Update the admin user to have admin role in both user_metadata and app_metadata
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb,
    raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@stylsia.com';

-- Update the demo brand user to have brand role in both user_metadata and app_metadata
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "brand"}'::jsonb,
    raw_app_meta_data = raw_app_meta_data || '{"role": "brand"}'::jsonb
WHERE email = 'demo@stylsia.com';

-- Verify both updates worked
SELECT 
    email, 
    raw_user_meta_data,
    raw_app_meta_data,
    raw_user_meta_data->>'role' as user_role,
    raw_app_meta_data->>'role' as app_role,
    created_at
FROM auth.users 
WHERE email IN ('admin@stylsia.com', 'demo@stylsia.com')
ORDER BY email;

-- Expected output should show:
-- admin@stylsia.com | {"email_verified": true, "role": "admin"} | {"role": "admin"} | admin | admin
-- demo@stylsia.com  | {"email_verified": true, "role": "brand"} | {"role": "brand"} | brand | brand

-- =============================================
-- CREATE BRAND USER WITH ROLE
-- =============================================
-- If you want to create a brand user via SQL as well:

-- First, create the brand user (optional - you can do this via UI)
-- Note: Replace 'your-brand-password' with actual password
/*
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'demo@stylsia.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"role": "brand", "email_verified": true}'::jsonb,
    '{"role": "brand"}'::jsonb
);
*/

-- Or if brand user already exists, just add the role:
-- UPDATE auth.users 
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "brand"}'::jsonb,
--     raw_app_meta_data = raw_app_meta_data || '{"role": "brand"}'::jsonb
-- WHERE email = 'demo@stylsia.com';

-- Verify all users have roles
SELECT 
    email, 
    raw_user_meta_data->>'role' as user_role,
    raw_app_meta_data->>'role' as app_role,
    created_at
FROM auth.users 
ORDER BY created_at DESC;