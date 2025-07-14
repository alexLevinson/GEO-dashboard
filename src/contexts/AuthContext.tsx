import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  customerName: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🚀 AuthProvider mounting...');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('🔍 fetchUserProfile called for userId:', userId);
    try {
      console.log('📊 About to query user_profiles table...');
      
      // Test basic async operation
      console.log('🧪 Testing basic async operation...');
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('🧪 Basic async operation completed');
      
      // Test fetch to external service
      console.log('🧪 Testing external fetch...');
      try {
        const response = await fetch('https://httpbin.org/get');
        console.log('🧪 External fetch status:', response.status);
      } catch (fetchError) {
        console.log('🧪 External fetch error:', fetchError);
      }
      
      // Skip auth calls - they hang! Go straight to database query
      console.log('⏭️ Skipping auth calls (they hang), going straight to database...');

      console.log('📊 Starting direct HTTP request to user_profiles...');
      console.log('📊 Query params:', { userId, table: 'user_profiles' });
      
      // Make direct HTTP request to Supabase REST API
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${userId}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      console.log('📊 HTTP response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ HTTP request failed:', response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log('📊 HTTP response data:', data);
      
      // Supabase returns array, we want single object
      const profile = data.length > 0 ? data[0] : null;
      console.log('📊 Query completed with result:', { data: profile, error: null });
      
      if (!profile) {
        console.error('❌ No user profile found');
        return null;
      }

      console.log('✅ Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('❌ Catch block - Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered, setting up auth...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, { session: !!session });

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in:', session.user.id);
        setUser(session.user);
        try {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUserProfile(profile);
            setIsAuthenticated(true);
            console.log('✅ Authentication successful');
          } else {
            console.error('❌ No user profile found for authenticated user');
            setIsAuthenticated(false);
          }
        } catch (profileError) {
          console.error('❌ Error fetching user profile:', profileError);
          setIsAuthenticated(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token refreshed for user:', session.user.id);
        setUser(session.user);
      }

      // Always stop loading after processing auth event
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setUser(data.user);
          setUserProfile(profile);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          return { success: false, error: 'User profile not found. Please contact your administrator.' };
        }
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    userProfile,
    login,
    logout,
    loading,
    isAdmin: userProfile?.is_admin || false,
    customerName: userProfile?.customer_name || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};