# Global Maintenance Mode Setup

This document explains how to set up the global maintenance mode functionality that works across all devices and sessions.

## What Changed

The maintenance mode has been upgraded from a session-based localStorage system to a global database-backed system that:

1. ✅ **Works globally across all devices and sessions**
2. ✅ **Persists maintenance state in database**
3. ✅ **Updates all connected users in real-time**
4. ✅ **Falls back to localStorage if database is unavailable**
5. ✅ **Shows loading states and error messages**

## Setup Instructions

### Step 1: Create the Database Table

You need to execute the SQL script in your Supabase dashboard to create the `system_settings` table:

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the content from `setup_system_settings.sql` (located in the project root)
4. Click **Run** to execute the SQL

This will create:
- `system_settings` table with proper structure
- Appropriate indexes for performance
- Row Level Security policies
- Default maintenance mode setting (disabled)

### Step 2: Verify Setup

1. Start your development server: `npm run dev`
2. Open the admin panel and go to **Settings**
3. You should see the **Maintenance Mode** toggle
4. Try toggling it - it should work without errors

### Step 3: Test Global Functionality

1. **Admin toggles maintenance ON:**
   - Open admin panel in one browser/device
   - Toggle maintenance mode to ON
   - You should see a success message

2. **Verify other users see maintenance page:**
   - Open the main website (`/`) in another browser/incognito window
   - You should see the maintenance page immediately
   - Other users browsing the site will also see the maintenance page

3. **Test real-time updates:**
   - Keep both windows open
   - Toggle maintenance mode OFF in admin panel
   - The maintenance page should disappear from the other window within 30 seconds

## How It Works

### Database Structure
```sql
system_settings (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE,           -- 'maintenance_mode'
  value JSONB,              -- true/false
  description TEXT,
  updated_at TIMESTAMPTZ,
  updated_by UUID
)
```

### Context Provider
The `MaintenanceContext` now:
- Fetches maintenance status from database on load
- Uses real-time subscriptions to detect changes
- Falls back to localStorage if database is unavailable
- Provides loading states and error handling

### Real-time Updates
- **Supabase Realtime:** Listens for changes to `system_settings` table
- **Polling Fallback:** Syncs every 30 seconds as backup
- **Immediate Updates:** Local state updates instantly when admin toggles

### Error Handling
- Database connection failures → Falls back to localStorage
- Permission errors → Shows error message to admin
- Table doesn't exist → Graceful degradation to localStorage

## Files Modified

1. **`src/contexts/MaintenanceContext.tsx`**
   - Added database integration
   - Added real-time subscriptions
   - Added error handling and loading states

2. **`src/pages/admin/AdminSettings.tsx`**
   - Enhanced UI with loading/error states
   - Async maintenance toggle handling
   - Better user feedback

3. **`setup_system_settings.sql`** (new)
   - Database schema and initial data

## Usage

### For Admins
1. Go to **Admin Panel → Settings**
2. Toggle **Maintenance Mode** switch
3. Wait for success/error message
4. The change applies globally immediately

### For Users
- When maintenance mode is ON: All public pages show maintenance screen
- When maintenance mode is OFF: Normal website functionality
- Admin panel is always accessible (not affected by maintenance mode)

## Troubleshooting

### If maintenance mode doesn't work globally:
1. Check browser console for errors
2. Verify the `system_settings` table exists in Supabase
3. Check if the SQL script was executed successfully
4. Ensure your Supabase connection is working

### If you see "localStorage only" messages:
1. The `system_settings` table doesn't exist
2. Run the SQL script in your Supabase dashboard
3. Refresh the application

### For debugging:
- Check browser console logs for detailed information
- Look for "Maintenance mode" related messages
- Verify network requests to Supabase in browser DevTools

## Security

- **Row Level Security:** Only authenticated admin users can modify settings
- **Read Access:** Anyone can read maintenance status (required for public users)
- **Admin Emails:** Hardcoded list of admin emails in the code
- **Audit Trail:** All changes are logged with user ID and timestamp

## Performance

- **Real-time subscriptions:** Minimal overhead, only listens to specific table changes
- **Caching:** Uses localStorage as backup cache
- **Efficient queries:** Only fetches the specific setting needed
- **Debounced updates:** Prevents excessive database calls
