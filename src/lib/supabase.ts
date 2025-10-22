import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table types
export type UserProfile = {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  region?: string;
  avatar_url?: string;
  mentor_status?: 'none' | 'pending' | 'approved' | 'rejected';
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Blog = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Mentor = {
  id: string;
  user_id: string;
  expertise_areas: string[];
  availability_status: 'available' | 'unavailable' | 'busy';
  rating: number;
  sessions_completed: number;
  total_mentees: number;
  created_at: string;
  updated_at: string;
};

export type MentorApplication = {
  id: string;
  user_id: string;
  expertise: string[];
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
  updated_at: string;
};

export type Program = {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  created_at: string;
};