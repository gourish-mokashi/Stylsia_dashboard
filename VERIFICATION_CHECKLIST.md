# Support Request Fix Verification Checklist

## Pre-Fix Issues
- [ ] Brands could send support requests from Messages page
- [ ] Support requests were stored in the database
- [ ] Admins could not see any support requests in Admin Support panel
- [ ] Admin Support page showed "No support requests found"

## Post-Fix Expected Behavior

### Brand Side (Messages Page)
- [ ] Brand can fill out support form with subject, description, priority
- [ ] Form submission creates record in `support_requests` table
- [ ] Brand receives confirmation message
- [ ] Brand can view their submitted requests

### Admin Side (Admin Support Panel)
- [ ] Admin can log into admin dashboard
- [ ] Admin Support page loads without errors
- [ ] Admin can see all support requests from all brands
- [ ] Each request shows: Brand name, Email, Subject, Priority, Status, Date
- [ ] Admin can click on request to view details
- [ ] Admin can update request status (New, In Progress, Resolved, Closed)
- [ ] Admin can click "Reply via Email" to open email client
- [ ] Status changes are saved and reflected immediately

### Database Verification
- [ ] `support_requests` table contains records
- [ ] Records have valid `brand_id` linking to `brands` table
- [ ] Admin functions `admin_get_all_support_requests()` work
- [ ] Admin functions `admin_update_support_request_status()` work
- [ ] RLS policies allow admin access

## Testing Steps

### 1. Test Brand Support Request Creation
1. Log in as a brand user
2. Go to Messages page
3. Fill out support form:
   - Subject: "Test Request - Login Issue"
   - Description: "I cannot log into my account"
   - Priority: High
4. Submit form
5. Verify success message appears
6. Check database that record was created

### 2. Test Admin Support Request Viewing
1. Log in as admin user (admin@stylsia.com)
2. Navigate to Admin > Support Requests
3. Verify the test request appears in the list
4. Check that brand name and email are displayed correctly
5. Verify request details are accurate

### 3. Test Admin Support Request Management
1. Click on a support request to view details
2. Change status from "New" to "In Progress"
3. Verify status updates successfully
4. Click "Reply via Email" button
5. Verify email client opens with pre-filled content
6. Change status to "Resolved"
7. Verify timestamp is recorded

### 4. Test Multiple Requests
1. Create 2-3 more support requests from different brand accounts
2. Verify admin can see all requests
3. Test filtering by status and priority
4. Test search functionality

## Database Commands to Check

```sql
-- Check support requests exist
SELECT COUNT(*) FROM support_requests;

-- Check requests with brand info
SELECT 
    sr.subject,
    sr.status,
    sr.priority,
    b.name as brand_name,
    b.contact_email
FROM support_requests sr
LEFT JOIN brands b ON sr.brand_id = b.id;

-- Test admin function
SELECT * FROM admin_get_all_support_requests() LIMIT 5;
```

## Files to Monitor for Errors
- [ ] `src/pages/admin/AdminSupport.tsx` - No console errors
- [ ] `src/contexts/AdminAuthContext.tsx` - Authentication works
- [ ] `src/hooks/useSupportRequests.ts` - Brand side creation works
- [ ] Browser console - No RLS policy errors
- [ ] Network tab - API calls succeed

## Common Issues to Watch For
- [ ] RLS policy errors in browser console
- [ ] "Permission denied" errors when fetching requests
- [ ] Empty support request list when data exists
- [ ] Status update failures
- [ ] Authentication issues for admin users

## Success Criteria
✅ Brands can create support requests
✅ Admins can view all support requests  
✅ Admins can manage request status
✅ No database permission errors
✅ Real-time updates work correctly
