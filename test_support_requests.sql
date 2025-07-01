-- Test Support Request Creation and Admin Access
-- This script can be run in Supabase SQL editor to test the support request flow

-- First, let's check the current state
SELECT 'Current support requests count:' as description, COUNT(*) as count FROM support_requests;
SELECT 'Current brands count:' as description, COUNT(*) as count FROM brands;

-- Check if we have any support requests
SELECT 
    sr.id,
    sr.subject,
    sr.status,
    sr.priority,
    sr.created_at,
    b.name as brand_name,
    b.contact_email
FROM support_requests sr
LEFT JOIN brands b ON sr.brand_id = b.id
ORDER BY sr.created_at DESC
LIMIT 5;

-- Test the admin function
SELECT 'Testing admin_get_all_support_requests function:' as description;
SELECT * FROM admin_get_all_support_requests() LIMIT 3;

-- Test creating a sample support request if none exist
DO $$
DECLARE
    sample_brand_id UUID;
    request_count INTEGER;
BEGIN
    -- Check if we have any support requests
    SELECT COUNT(*) INTO request_count FROM support_requests;
    
    IF request_count = 0 THEN
        -- Find or create a test brand
        SELECT id INTO sample_brand_id FROM brands LIMIT 1;
        
        IF sample_brand_id IS NULL THEN
            -- Create a test brand
            INSERT INTO brands (id, name, contact_email, status, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                'Test Brand',
                'test@testbrand.com',
                'active',
                NOW(),
                NOW()
            )
            RETURNING id INTO sample_brand_id;
            
            RAISE NOTICE 'Created test brand with ID: %', sample_brand_id;
        END IF;
        
        -- Create test support requests
        INSERT INTO support_requests (
            id,
            brand_id,
            subject,
            description,
            priority,
            status,
            has_attachment,
            created_at,
            updated_at
        ) VALUES 
        (
            gen_random_uuid(),
            sample_brand_id,
            'Test Support Request - Login Issues',
            'I am having trouble logging into my account. Can you please help?',
            'medium',
            'new',
            false,
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            sample_brand_id,
            'Test Support Request - Product Upload',
            'I cannot upload products to my store. The upload button is not working.',
            'high',
            'new',
            false,
            NOW() - INTERVAL '1 hour',
            NOW() - INTERVAL '1 hour'
        );
        
        RAISE NOTICE 'Created 2 test support requests';
    ELSE
        RAISE NOTICE 'Support requests already exist (%), skipping test data creation', request_count;
    END IF;
END $$;

-- Verify the results
SELECT 'Final verification:' as description;
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_requests,
    COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_requests
FROM support_requests;

-- Test that the admin function works
SELECT 'Admin function test results:' as description;
SELECT 
    brand_name,
    subject,
    priority,
    status,
    created_at
FROM admin_get_all_support_requests()
ORDER BY created_at DESC;
