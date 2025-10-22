import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { UserProfile, Blog, Mentor, MentorApplication, Program } from '../lib/supabase';
import { useState, useEffect } from 'react';

// Profile Hooks
export const useProfile = (userId?: string) => {
  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return { profile, isLoading, error };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', updates.user_id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', data.user_id], data);
    },
  });
};

// Blog Hooks
export const useBlogs = (options?: { published?: boolean }) => {
  const { data: blogs, isLoading, error } = useQuery<Blog[]>({
    queryKey: ['blogs', options],
    queryFn: async () => {
      let query = supabase.from('blogs').select('*');
      if (options?.published !== undefined) {
        query = query.eq('published', options.published);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return { blogs, isLoading, error };
};

export const useBlog = (blogId?: string) => {
  const { data: blog, isLoading, error } = useQuery<Blog>({
    queryKey: ['blog', blogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', blogId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!blogId,
  });

  return { blog, isLoading, error };
};

// Mentor Hooks
export const useMentors = (options?: { available?: boolean }) => {
  const { data: mentors, isLoading, error } = useQuery<Mentor[]>({
    queryKey: ['mentors', options],
    queryFn: async () => {
      let query = supabase
        .from('mentors')
        .select(`
          *,
          profiles:profiles(name, profile_photo_url)
        `);
      
      if (options?.available) {
        query = query.eq('availability_status', 'available');
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return { mentors, isLoading, error };
};

export const useMentorApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (application: Partial<MentorApplication>) => {
      const { data, error } = await supabase
        .from('mentor_applications')
        .insert(application)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor_applications'] });
    },
  });
};

// Programs Hooks
export const usePrograms = () => {
  const { data: programs, isLoading, error } = useQuery<Program[]>({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return { programs, isLoading, error };
};

// File Upload Hooks
export const useAvatarUpload = () => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadAvatar = async (userId: string, file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Invalidate profile query to show new avatar
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });

      return publicUrl;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadAvatar, uploading };
};

// Real-time Notifications Hook
export const useNotifications = (userId?: string) => {
  const queryClient = useQueryClient();
  const [newNotification, setNewNotification] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNewNotification(payload.new);
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return { notifications, newNotification, isLoading, error };
};

// Admin Hooks
export const useAdminStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: mentorsCount },
        { count: blogsCount },
        { count: programsCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('mentors').select('*', { count: 'exact' }),
        supabase.from('blogs').select('*', { count: 'exact' }),
        supabase.from('programs').select('*', { count: 'exact' }),
      ]);

      return {
        users: usersCount,
        mentors: mentorsCount,
        blogs: blogsCount,
        programs: programsCount,
      };
    },
  });

  return { stats, isLoading, error };
};