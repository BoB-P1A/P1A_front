import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user' | 'evaluator' | 'developer' | 'privacy-team' | 'planning-team';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  fullName?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

interface LoginCredentials {
  id: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile and role
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, company_name')
            .eq('id', session.user.id)
            .single();

          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            name: profile?.full_name || '',
            email: session.user.email!,
            role: (roleData?.role as UserRole) || 'user',
            fullName: profile?.full_name,
            companyName: profile?.company_name,
            company: profile?.company_name,
          });
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Fetch user data
        Promise.all([
          supabase.from('profiles').select('full_name, company_name').eq('id', session.user.id).single(),
          supabase.from('user_roles').select('role').eq('user_id', session.user.id).single()
        ]).then(([profileResult, roleResult]) => {
          setUser({
            id: session.user.id,
            name: profileResult.data?.full_name || '',
            email: session.user.email!,
            role: (roleResult.data?.role as UserRole) || 'user',
            fullName: profileResult.data?.full_name,
            companyName: profileResult.data?.company_name,
            company: profileResult.data?.company_name,
          });
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || ''
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Legacy methods for backward compatibility
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // Try to sign in with id as email
    const { error } = await signIn(credentials.id, credentials.password);
    return !error;
  };

  const logout = () => {
    signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut, login, logout }}>
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
