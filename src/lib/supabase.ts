import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single instance of the Supabase client when vars are present.
// We avoid throwing at build time so CI (Vercel) won't fail when envs are absent.
let _supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Provide a helpful runtime-failing proxy so usage errors are explicit.
  // This prevents build-time crashes but still surfaces a clear error if code tries to use the client.
  // eslint-disable-next-line no-console
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. Supabase client not initialized.');
  _supabase = new Proxy({}, {
    get() {
      return () => {
        throw new Error('Supabase client not initialized. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment variables.');
      };
    },
  });
}

export const supabase = _supabase;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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