import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) {
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
    
    toast({
      title: "Success!",
      description: "Your account has been created. Please check your email.",
    });
    
    return { error: null };
  };

  // Sync backend user record after Supabase signup (create profile placeholder)
  const syncBackendUser = async (email: string, name?: string, avatarUrl?: string, bio?: string) => {
    try {
      await fetch('/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, profile_photo_url: avatarUrl, bio })
      });
    } catch (e) {
      console.error('failed to sync backend user', e);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
    
    return { error: null };
  };

  // obtain backend JWT after sign in (or sign up) — call /users/sync-token
  const obtainBackendToken = async (email: string, name?: string, avatarUrl?: string) => {
    // If a token already exists, return it (simple cache). We could decode and check exp if needed.
    const existing = localStorage.getItem('backend_token');
    if (existing) return existing;

    try {
      console.log('obtainBackendToken: calling /users/sync-token with email:', email);
      const res = await fetch('/users/sync-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, profile_photo_url: avatarUrl })
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('obtainBackendToken failed:', res.status, errText);
        return null;
      }
      const data = await res.json();
      console.log('obtainBackendToken response:', data);
      if (data.access_token) {
        localStorage.setItem('backend_token', data.access_token);
        if (data.user_id) localStorage.setItem('backend_user_id', String(data.user_id));
        console.log('obtainBackendToken: token saved, user_id:', data.user_id);
        return data.access_token;
      } else {
        console.error('obtainBackendToken: no access_token in response:', data);
        return null;
      }
    } catch (e) {
      console.error('obtainBackendToken exception:', String(e));
    }
    return null;
  };

  const backendUserId = () => {
    const v = localStorage.getItem('backend_user_id');
    return v ? Number(v) : null;
  };

  const updateProfileBackend = async (payload: any) => {
    let token = localStorage.getItem('backend_token');
    if (!token) {
      console.log('updateProfileBackend: no token in localStorage, skipping');
      return null;
    }
    try {
      const res = await fetch('/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('updateProfileBackend failed:', res.status, errText);
      }
      return res;
    } catch (e) {
      console.error('updateProfileBackend exception:', String(e));
      return null;
    }
  };

  const becomeMentor = async (expertise_areas?: string, availability_status?: string) => {
    const token = localStorage.getItem('backend_token');
    if (!token) {
      console.error('becomeMentor: no token in localStorage');
      return null;
    }
    try {
      console.log('becomeMentor: calling /mentors/dev/become-mentor');
      const res = await fetch('/mentors/dev/become-mentor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          expertise_areas: expertise_areas || 'General Mentoring', 
          availability_status: availability_status || 'available' 
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('becomeMentor failed:', res.status, errText);
        return null;
      }
      const data = await res.json();
      console.log('becomeMentor response:', data);
      return data;
    } catch (e) {
      console.error('becomeMentor exception:', String(e));
      return null;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    // Clear backend tokens and user id from localStorage
    localStorage.removeItem('backend_token');
    localStorage.removeItem('backend_user_id');
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    syncBackendUser,
    obtainBackendToken,
    updateProfileBackend,
    backendUserId,
    becomeMentor,
  };
};
