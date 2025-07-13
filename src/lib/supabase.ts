import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'defined' : 'undefined');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'defined' : 'undefined');
  throw new Error('Missing Supabase environment variables');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (err) {
  console.error('Invalid VITE_SUPABASE_URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format');
}

// Configure client options with improved error handling
const clientOptions = {
  auth: {
    persistSession: false, // ❗ important : évite le header Authorization
    autoRefreshToken: false,
    detectSessionInUrl: false,
	storage: {
		getItem: () => null,
		setItem: () => {},
		removeItem: () => {}
	}
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'it-process-framework',
      'apikey': supabaseAnonKey // injecte explicitement l'apikey
    },
    fetch: async (url: string, options: RequestInit) => {
      const maxRetries = 3;
      let attempt = 0;
      let lastError;

      while (attempt < maxRetries) {
        try {
          console.log(`Attempting request to: ${url} (attempt ${attempt + 1}/${maxRetries})`);
          
          // Add timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('Request timeout after 15 seconds');
            controller.abort();
          }, 15000); // 15 second timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          console.log(`Request successful: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            // Handle specific HTTP status codes with detailed messages
            if (response.status === 503) {
              throw new Error(`Service temporarily unavailable (${response.status}). The Supabase service may be experiencing issues. Please try again in a few minutes.`);
            }
            if (response.status >= 500) {
              throw new Error(`Server error (${response.status}). The database server is experiencing issues. Please try again later.`);
            }
            if (response.status === 404) {
              throw new Error(`Resource not found (${response.status}). Please check your database configuration.`);
            }
            if (response.status === 401 || response.status === 403) {
              throw new Error(`Authentication error (${response.status}). Please check your API keys and permissions.`);
            }
            if (response.status === 429) {
              throw new Error(`Rate limit exceeded (${response.status}). Please wait a moment before trying again.`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        } catch (err) {
          lastError = err;
          console.error(`Request failed (attempt ${attempt + 1}/${maxRetries}):`, err);
          
          // Don't retry on authentication errors, client errors, or rate limit errors
          if (err instanceof Error) {
            if (err.message.includes('Authentication error') || 
                err.message.includes('Resource not found') ||
                err.message.includes('Rate limit exceeded')) {
              throw err;
            }
            
            // Handle specific network errors
            if (err.name === 'AbortError') {
              console.log('Request was aborted due to timeout');
            } else if (err.message.includes('Failed to fetch')) {
              console.log('Network fetch failed - possible connectivity issue');
            } else if (err.message.includes('NetworkError')) {
              console.log('Network error occurred');
            }
          }
          
          attempt++;
          
          if (attempt === maxRetries) {
            break;
          }
          
          // Exponential backoff with jitter
          const baseDelay = 1000 * Math.pow(2, attempt);
          const jitter = Math.random() * 1000;
          const delay = Math.min(baseDelay + jitter, 10000);
          
          console.log(`Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // Enhance the final error message
      if (lastError instanceof Error) {
        if (lastError.name === 'AbortError') {
          throw new Error('Request timed out. Please check your internet connection and try again.');
        }
        if (lastError.message.includes('Failed to fetch') || lastError.message.includes('NetworkError')) {
          throw new Error('Network connection failed. Please check your internet connection and firewall settings. If you\'re using a VPN, try disconnecting it temporarily.');
        }
        throw lastError;
      }
      
      throw new Error('Request failed after multiple retries. Please check your network connection and try again later.');
    }
  }
};

// Initialize the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, clientOptions);
await supabase.auth.setSession(null)   // <-- ajoute juste cette ligne

// Helper function to check database connection with comprehensive error handling
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking database connection...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Using anon key:', supabaseAnonKey ? 'Yes' : 'No');
    
    const { data, error } = await supabase
      .from('processes')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Database query error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('Database connection successful, found', data?.length || 0, 'processes');
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    
    if (err instanceof Error) {
      // Re-throw with more context
      if (err.message.includes('Service temporarily unavailable')) {
        throw new Error('Supabase service is currently unavailable. Please try again in a few minutes or check the Supabase status page.');
      }
      if (err.message.includes('Network connection failed')) {
        throw new Error('Unable to connect to the database. Please check your internet connection and firewall settings.');
      }
      if (err.message.includes('Request timed out')) {
        throw new Error('Database connection timed out. Please check your network connection.');
      }
      if (err.message.includes('upstream connect error') || err.message.includes('connection timeout')) {
        throw new Error('Database connection failed. The service may be temporarily unavailable.');
      }
      throw err;
    }
    
    throw new Error('Failed to connect to database. Please try again.');
  }
};

// Helper function to handle database errors with more specific messages
export const handleDatabaseError = (error: unknown): string => {
  if (error instanceof Error) {
    // Handle specific error types with user-friendly messages
    if (error.message.includes('Service temporarily unavailable')) {
      return 'The database service is temporarily unavailable. Please try again in a few minutes.';
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Network connection failed')) {
      return 'Network connection error. Please check your internet connection and try again. If you\'re using a VPN, try disconnecting it temporarily.';
    }
    if (error.message.includes('Request timed out') || error.name === 'AbortError') {
      return 'Connection timed out. Please check your network connection and try again.';
    }
    if (error.message.includes('JWT') || error.message.includes('Authentication error')) {
      return 'Session expired. Please log in again.';
    }
    if (error.message.includes('HTTP error!') && error.message.includes('503')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    if (error.message.includes('HTTP error!') && error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    if (error.message.includes('upstream connect error') || error.message.includes('connection timeout')) {
      return 'Database connection failed. The service may be temporarily unavailable.';
    }
    if (error.message.includes('Rate limit exceeded')) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

// Helper function to check service status with detailed diagnostics
export const checkServiceStatus = async (): Promise<{ available: boolean; message: string; details?: any }> => {
  try {
    await checkDatabaseConnection();
    
    return { 
      available: true, 
      message: 'Service is available'
    };
  } catch (err) {
    const message = handleDatabaseError(err);
    return { 
      available: false, 
      message,
      details: { error: err instanceof Error ? err.message : String(err) }
    };
  }
};

// Helper function to test database with detailed diagnostics
export const testDatabaseStatus = async () => {
  console.log('🔍 Running comprehensive database diagnostics...');
  
  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic connection...');
    const connectionTest = await checkServiceStatus();
    console.log('Connection test result:', connectionTest);
    
    // Test 2: Count records in each table
    console.log('Test 2: Counting records...');
    const counts = await Promise.allSettled([
      supabase.from('domains').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('processes').select('*', { count: 'exact', head: true })
    ]);
    
    counts.forEach((result, index) => {
      const tableName = ['domains', 'categories', 'processes'][index];
      if (result.status === 'fulfilled') {
        console.log(`${tableName}: ${result.value.count} records`);
      } else {
        console.error(`${tableName}: Error -`, result.reason);
      }
    });
    
    return connectionTest;
  } catch (err) {
    console.error('Diagnostic test failed:', err);
    return { available: false, message: handleDatabaseError(err) };
  }
};

// Helper function to sign in
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Helper function to create a new user
export const createUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`
    }
  });

  if (error) throw error;
  return data;
};

// Initialize admin and user accounts if they don't exist
export const initializeAuthUsers = async () => {
  try {
    // Try to sign in as admin to check if it exists
    const { error: adminSignInError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    });

    // If admin doesn't exist, create it
    if (adminSignInError) {
      await supabase.auth.signUp({
        email: 'admin@example.com',
        password: 'admin123'
      });
    }

    // Try to sign in as regular user to check if it exists
    const { error: userSignInError } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'user123'
    });

    // If user doesn't exist, create it
    if (userSignInError) {
      await supabase.auth.signUp({
        email: 'user@example.com',
        password: 'user123'
      });
    }

    return true;
  } catch (err) {
    console.error('Error initializing auth users:', err);
    return false;
  }
};