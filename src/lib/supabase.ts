import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL:', supabaseUrl);
  throw new Error(
    `Invalid Supabase URL format: ${supabaseUrl}. Please check your VITE_SUPABASE_URL in the .env file.`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'stylsia-app',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test connection function with better error handling
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // First test basic connectivity
    const { data, error } = await supabase
      .from('brands')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      
      // Check if it's a table not found error
      if (error.message?.includes('relation "public.brands" does not exist')) {
        console.error('Database tables not found. Please run the database setup script.');
        return false;
      }
      
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    
    // Check for network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error: Unable to reach Supabase. Please check your internet connection and Supabase URL.');
    }
    
    return false;
  }
};

// Approved brands list - in production, this would be managed in the database
export const approvedBrands = [
  'brand@nike.com',
  'partner@adidas.com',
  'contact@zara.com',
  'hello@hm.com',
  'info@uniqlo.com',
  'demo@stylsia.com', // Demo account for testing
];

export const checkBrandApproval = (email: string): boolean => {
  return approvedBrands.includes(email.toLowerCase());
};