import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase, signIn as supabaseSignIn, signOut as supabaseSignOut } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // If no session and not on login page, redirect to login
      if (!session && !isLoginPage) {
        navigate('/login');
      }
      // If has session and on login page, redirect to home
      else if (session && isLoginPage) {
        navigate('/');
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Redirect to login if not authenticated
      if (!session && !isLoginPage) {
        navigate('/login');
      } 
      // Redirect to home if authenticated and on login page
      else if (session && isLoginPage) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isLoginPage]);

  const signIn = async (email: string, password: string) => {
    try {
      const { session } = await supabaseSignIn(email, password);
      if (!session) {
        throw new Error('No session after sign in');
      }
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabaseSignOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    session,
    user,
    signIn,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}