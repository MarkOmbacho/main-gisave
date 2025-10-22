import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sniypsdtsqlapdwnlvoh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuaXlwc2R0c3FsYXBkd25sdm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODExODgsImV4cCI6MjA3NjU1NzE4OH0.Eflm69gHO2Z0uhsdmmvEc8JnmPeOrseOJ4ScMrSk8mE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table types
export type UserProfile = {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  region?: string;
  avatar_url?: string;
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