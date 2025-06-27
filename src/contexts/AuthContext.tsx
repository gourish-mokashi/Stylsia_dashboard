import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, checkBrandApproval } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, brandName: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  connectionError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Test connection first with a simple query
        const { data: testData, error: testError } = await supabase
          .from('brands')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('Supabase connection failed:', testError);
          
          // Check if it's a missing table error
          if (testError.message?.includes('relation "public.brands" does not exist')) {
            console.error('Database tables not found. Please run the database setup script in Supabase SQL Editor.');
          }
          
          setConnectionError(true);
          setLoading(false);
          return;
        }

        setConnectionError(false);
        console.log('Supabase connection successful');

        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        } else if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          console.log('Initial session loaded:', initialSession ? 'authenticated' : 'not authenticated');
          
          // Debug user metadata
          if (initialSession?.user) {
            console.log('User metadata:', initialSession.user.user_metadata);
            console.log('User role:', initialSession.user.user_metadata?.role);
          }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session ? 'authenticated' : 'not authenticated');
            if (mounted) {
              setSession(session);
              setUser(session?.user ?? null);
              
              // Debug user metadata
              if (session?.user) {
                console.log('User metadata after auth change:', session.user.user_metadata);
                console.log('User role after auth change:', session.user.user_metadata?.role);
              }
              
              setLoading(false);
            }
          }
        );

        if (mounted) {
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        // Check for specific error types
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.error('Network error: Unable to reach Supabase. Please check your internet connection and environment variables.');
        }
        
        setConnectionError(true);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setConnectionError(false);
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful');
      console.log('User metadata after sign in:', data.user?.user_metadata);
      return { data };
    } catch (error) {
      console.error('Sign in error:', error);
      setConnectionError(true);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, brandName: string) => {
    try {
      setConnectionError(false);
      
      // Check if brand is approved
      if (!checkBrandApproval(email)) {
        return { 
          error: { 
            message: 'Your brand is not yet approved for our platform. Please contact support for approval.' 
          } 
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            brand_name: brandName,
            role: 'brand'
          }
        }
      });

      if (error) {
        return { error };
      }

      // Create brand record if signup successful
      if (data.user) {
        const { error: brandError } = await supabase
          .from('brands')
          .insert([
            {
              id: data.user.id,
              name: brandName,
              contact_email: email,
              status: 'active'
            }
          ]);

        if (brandError) {
          console.error('Error creating brand record:', brandError);
        }
      }

      return { data };
    } catch (error) {
      console.error('Sign up error:', error);
      setConnectionError(true);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setConnectionError(false);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      setConnectionError(true);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    connectionError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};