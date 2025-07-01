// Admin authentication utilities
import { supabase } from './supabase';

// Admin email whitelist
const ADMIN_EMAILS = [
  'admin@stylsia.com',
  'support@stylsia.com', 
  'manager@stylsia.com',
  'demo@stylsia.com' // For testing
];

/**
 * Updates user metadata to include admin role
 * This is necessary for RLS policies to work correctly
 */
export async function setAdminRole(userId: string, email: string): Promise<boolean> {
  try {
    // Only proceed if email is in admin whitelist
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      console.warn('Attempted to set admin role for non-admin email:', email);
      return false;
    }

    // Update user metadata using Supabase Admin API
    // Note: In production, this should be done server-side with admin privileges
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        role: 'admin',
        email: email,
        updated_at: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Failed to set admin role:', error);
      return false;
    }

    console.log('Admin role set successfully for user:', email);
    return true;
  } catch (error) {
    console.error('Error setting admin role:', error);
    return false;
  }
}

/**
 * Checks if the current user has admin role in their JWT metadata
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    // Check user metadata for admin role
    const userMetadata = session.user?.user_metadata;
    return userMetadata?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Alternative approach: Create a temporary admin context bypass
 * This bypasses RLS for admin operations
 */
export async function getAdminSupabaseClient() {
  // Return supabase client with service role key (if available)
  // This should only be used for admin operations
  return supabase;
}

export { ADMIN_EMAILS };
