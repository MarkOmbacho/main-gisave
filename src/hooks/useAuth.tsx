import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';
import { useToast } from './use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  becomeMentor: () => Promise<void>;
  loading: boolean;
  error: Error | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Only initialize auth if Supabase is properly configured
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping auth initialization');
      setLoading(false);
      return;
    }

    try {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
        setLoading(false);
      }).catch((error) => {
        console.error('Error getting session:', error);
        setLoading(false);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error initializing auth:', error);
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error as Error);
      toast({
        title: "Error",
        description: "Could not fetch user profile",
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            name,
          },
        },
      });
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Please check your email to verify your account.",
      });
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error as Error);
      toast({
        title: "Signup Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error as Error);
      toast({
        title: "Login Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setProfile(null);
      toast({
        title: "Goodbye!",
        description: "Successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error as Error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      
      toast({
        title: "Password Reset Sent",
        description: "Please check your email for the reset link.",
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      setError(error as Error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      setError(null);
      
      if (!user) throw new Error('No user logged in');
      
      // First update the auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          avatar_url: profile.avatar_url,
        }
      });
      
      if (updateError) throw updateError;

      // Then update or create the profile record
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      // Refresh the profile
      await fetchProfile(user.id);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error as Error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const becomeMentor = async () => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');

      // Create mentor application record
      const { error: applicationError } = await supabase
        .from('mentor_applications')
        .insert({
          user_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (applicationError) throw applicationError;

      // Update user profile to indicate pending mentor status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          mentor_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      await fetchProfile(user.id);

      toast({
        title: "Application Submitted",
        description: "Your mentor application is being reviewed. We'll notify you of the decision.",
      });
    } catch (error) {
      console.error('Error applying for mentor:', error);
      setError(error as Error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    session,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updateProfile,
    becomeMentor,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
