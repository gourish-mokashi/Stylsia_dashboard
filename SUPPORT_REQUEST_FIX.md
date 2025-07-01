# Support Request Issue Fix

## Problem Description
When brands send support requests through the Stylsia dashboard, admin users are unable to receive/view these requests in the Admin Support panel.

## Root Cause Analysis
The issue is caused by **Row Level Security (RLS) policies** in the Supabase database that prevent admin users from accessing support requests. The specific problems were:

1. **Admin Role Not Set**: Admin users don't have the `role: 'admin'` property in their JWT user metadata
2. **Restrictive RLS Policies**: The policies require exact role matching which wasn't being satisfied
3. **Authentication Context**: The admin authentication wasn't properly setting user metadata

## Current RLS Policy (Problematic)
```sql
CREATE POLICY "admins_read_all_support_requests" ON support_requests
    FOR SELECT 
    USING (
        auth.role() = 'authenticated' 
        AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    );
```

## Solutions Implemented

### 1. Enhanced Admin Authentication
**File**: `src/contexts/AdminAuthContext.tsx`
- Updated the sign-in process to set user metadata with admin role
- Added metadata update during successful admin authentication

### 2. Created Admin Bypass Functions
**File**: `supabase/migrations/20250701000000_fix_admin_support_access.sql`
- Created `admin_get_all_support_requests()` function with `SECURITY DEFINER` to bypass RLS
- Created `admin_update_support_request_status()` function for updating request status
- Updated RLS policies to be more permissive with fallback email checking

### 3. Updated Admin Support Component
**File**: `src/pages/admin/AdminSupport.tsx`
- Modified to use the new admin functions as the primary data source
- Added fallback mechanisms for data fetching
- Enhanced error handling and status updates

### 4. Improved RLS Policies
The new policies check for both role metadata AND admin email addresses:
```sql
CREATE POLICY "admins_read_all_support_requests" ON support_requests
    FOR SELECT 
    USING (
        auth.role() = 'authenticated' AND (
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
            OR
            auth.jwt() ->> 'email' IN (
                'admin@stylsia.com',
                'support@stylsia.com', 
                'manager@stylsia.com',
                'demo@stylsia.com'
            )
        )
    );
```

## Testing
Created `test_support_requests.sql` to:
- Verify support request creation
- Test admin function access
- Create sample data if needed

## How It Works Now

### Brand Side (Creating Support Requests)
1. Brand user fills out support form in Messages page
2. `useSupportRequests` hook calls `SupportRequestRepository.create()`
3. Support request is inserted into `support_requests` table with `brand_id = user.id`

### Admin Side (Viewing Support Requests)
1. Admin logs into admin dashboard
2. Admin authentication sets user metadata with `role: 'admin'`
3. Admin Support page calls `admin_get_all_support_requests()` function
4. Function bypasses RLS and returns all support requests with brand info
5. Admin can view, update status, and respond to requests

## Files Modified
- `src/contexts/AdminAuthContext.tsx` - Enhanced admin authentication
- `src/pages/admin/AdminSupport.tsx` - Updated to use admin functions
- `supabase/migrations/20250701000000_fix_admin_support_access.sql` - New database functions and policies
- `src/lib/adminAuth.ts` - New admin utilities (created)
- `test_support_requests.sql` - Testing script (created)

## Admin Email Whitelist
The following emails have admin access:
- admin@stylsia.com
- support@stylsia.com
- manager@stylsia.com
- demo@stylsia.com

## Next Steps
1. Apply the database migration in production
2. Test with real support request flow
3. Monitor admin access and support request visibility
4. Consider adding real-time subscriptions for admin notifications

## Security Notes
- `SECURITY DEFINER` functions run with elevated privileges - only use for trusted admin operations
- Admin email whitelist should be regularly reviewed
- Consider implementing proper RBAC (Role-Based Access Control) for production
