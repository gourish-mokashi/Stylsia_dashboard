import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  sessionExpiry: Date | null;
  refreshSession: () => Promise<boolean>;
  isSessionValid: () => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Session storage keys
const SESSION_STORAGE_KEY = 'stylsia_admin_session';
const SESSION_EXPIRY_KEY = 'stylsia_admin_session_expiry';
const REMEMBER_ME_KEY = 'stylsia_admin_remember_me';

// Session configuration
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh if session expires within 5 minutes

// Admin email whitelist
const ADMIN_EMAILS = [
  'admin@stylsia.com',
  'support@stylsia.com',
  'manager@stylsia.com'
];

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  // Check if session is still valid
  const isSessionValid = useCallback((): boolean => {
    if (!sessionExpiry) return false;
    
    const now = new Date();
    const timeSinceActivity = now.getTime() - lastActivity.getTime();
    
    // Check if session has expired or user has been inactive too long
    return now < sessionExpiry && timeSinceActivity < INACTIVITY_TIMEOUT;
  }, [sessionExpiry, lastActivity]);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    setLastActivity(new Date());
    localStorage.setItem('stylsia_admin_last_activity', new Date().toISOString());
  }, []);

  // Save session to localStorage
  const saveSession = useCallback((session: Session, rememberMe: boolean = false) => {
    const duration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
    const expiry = new Date(Date.now() + duration);
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toISOString());
    localStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
    localStorage.setItem('stylsia_admin_last_activity', new Date().toISOString());
    
    setSessionExpiry(expiry);
  }, []);

  // Load session from localStorage
  const loadSession = useCallback(async (): Promise<boolean> => {
    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      const storedExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);
      const lastActivityStr = localStorage.getItem('stylsia_admin_last_activity');
      
      if (!storedSession || !storedExpiry) {
        return false;
      }

      const expiry = new Date(storedExpiry);
      const lastActivityTime = lastActivityStr ? new Date(lastActivityStr) : new Date();
      const now = new Date();
      
      // Check if session has expired or user has been inactive too long
      const timeSinceActivity = now.getTime() - lastActivityTime.getTime();
      if (now >= expiry || timeSinceActivity >= INACTIVITY_TIMEOUT) {
        clearSession();
        return false;
      }

      const sessionData = JSON.parse(storedSession);
      
      setSession(sessionData);
      setSessionExpiry(expiry);
      setLastActivity(lastActivityTime);
      
      // Create user for stored session
      if (sessionData.user) {
        setUser(sessionData.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading session:', error);
      clearSession();
      return false;
    }
  }, []);

  // Clear session from localStorage
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem('stylsia_admin_last_activity');
    setSession(null);
    setSessionExpiry(null);
    setUser(null);
  }, []);

  // Refresh session if needed
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      if (!session || !sessionExpiry) {
        return false;
      }

      const now = new Date();
      const timeUntilExpiry = sessionExpiry.getTime() - now.getTime();
      
      // Only refresh if session expires soon
      if (timeUntilExpiry > REFRESH_THRESHOLD) {
        return true;
      }

      // Try to refresh with Supabase
      const { data, error } = await supabase.auth.refreshSession();
      
      if (data.session && !error) {
        const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
        saveSession(data.session, rememberMe);
        setSession(data.session);
        setUser(data.user);
        updateActivity();
        return true;
      }

      // If Supabase refresh fails, extend current session if it's still valid
      if (isSessionValid()) {
        const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
        const duration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
        const newExpiry = new Date(Date.now() + duration);
        
        localStorage.setItem(SESSION_EXPIRY_KEY, newExpiry.toISOString());
        setSessionExpiry(newExpiry);
        updateActivity();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }, [session, sessionExpiry, isSessionValid, saveSession, updateActivity]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First try to load from localStorage
        const sessionLoaded = await loadSession();
        
        if (sessionLoaded && mounted) {
          setLoading(false);
          return;
        }

        // Then try to get current Supabase session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession && mounted) {
          const userEmail = currentSession.user?.email?.toLowerCase() || '';
          const isAdminUser = ADMIN_EMAILS.includes(userEmail);
          
          if (isAdminUser) {
            setSession(currentSession);
            setUser(currentSession.user);
            saveSession(currentSession, false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          clearSession();
        } else if (event === 'SIGNED_IN' && session) {
          const userEmail = session.user?.email?.toLowerCase() || '';
          const isAdminUser = ADMIN_EMAILS.includes(userEmail);
          
          if (isAdminUser) {
            setSession(session);
            setUser(session.user);
            saveSession(session, false);
            updateActivity();
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadSession, saveSession, clearSession, updateActivity]);

  // Set up activity tracking
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set up periodic session validation
    const validationInterval = setInterval(() => {
      if (!isSessionValid()) {
        console.log('Session expired or user inactive, signing out...');
        signOut();
      }
    }, 60000); // Check every minute

    // Set up automatic session refresh
    const refreshInterval = setInterval(() => {
      refreshSession();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(validationInterval);
      clearInterval(refreshInterval);
    };
  }, [user, isSessionValid, refreshSession, updateActivity]);

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true);

      // Check if email is in admin whitelist
      if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        return {
          success: false,
          error: 'Access denied. This email is not authorized for admin access.'
        };
      }

      // Always try Supabase authentication to get a valid JWT
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        // Verify the user is still in the admin whitelist after successful auth
        const userEmail = data.session.user?.email?.toLowerCase() || '';
        if (!ADMIN_EMAILS.includes(userEmail)) {
          // Sign out from Supabase if not authorized
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Access denied. This email is not authorized for admin access.'
          };
        }

        // Try to update user metadata to include admin role
        try {
          await supabase.auth.updateUser({
            data: { 
              role: 'admin',
              updated_at: new Date().toISOString()
            }
          });
        } catch (metadataError) {
          console.warn('Could not update user metadata:', metadataError);
          // Continue anyway as this is not critical for basic functionality
        }

        saveSession(data.session, rememberMe);
        updateActivity();
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local session first
      clearSession();
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user ? 
    ADMIN_EMAILS.includes(user.email?.toLowerCase() || '') : 
    false;

  return (
    <AdminAuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signOut,
      isAdmin,
      sessionExpiry,
      refreshSession,
      isSessionValid,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}