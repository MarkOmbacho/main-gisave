-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table that extends Supabase auth.users
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text,
  bio text,
  region text,
  profile_photo_url text,
  is_premium boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create blogs table
create table public.blogs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  author_id uuid references auth.users(id) on delete set null,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create mentors table
create table public.mentors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  expertise_areas text[] not null default '{}',
  availability_status text check (availability_status in ('available', 'unavailable', 'busy')) default 'available',
  rating decimal(3,2) check (rating >= 0 and rating <= 5) default 0,
  sessions_completed integer default 0,
  total_mentees integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create mentor applications table
create table public.mentor_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  expertise text[] not null default '{}',
  documents text[] not null default '{}',
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create programs table
create table public.programs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  image_url text,
  is_premium boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create payments table
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  amount decimal(10,2) not null check (amount > 0),
  currency text not null default 'USD',
  status text check (status in ('pending', 'completed', 'failed')) default 'pending',
  payment_method text not null,
  created_at timestamptz default now()
);

-- Set up Row Level Security (RLS)

-- Profiles: users can read all profiles but only update their own
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles
  for select using (true);

create policy "Users can update their own profile"
  on public.profiles
  for update using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles
  for insert with check (auth.uid() = user_id);

-- Blogs: anyone can read published blogs, authors can manage their own
alter table public.blogs enable row level security;

create policy "Published blogs are viewable by everyone"
  on public.blogs
  for select using (published = true);

create policy "Authors can manage their own blogs"
  on public.blogs
  for all using (auth.uid() = author_id);

create policy "Admins can manage all blogs"
  on public.blogs
  for all using (
    exists (
      select 1 from auth.users
      where auth.uid() = id and auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Mentors: public read, self-manage
alter table public.mentors enable row level security;

create policy "Mentors are viewable by everyone"
  on public.mentors
  for select using (true);

create policy "Mentors can manage their own profile"
  on public.mentors
  for all using (auth.uid() = user_id);

create policy "Admins can manage all mentors"
  on public.mentors
  for all using (
    exists (
      select 1 from auth.users
      where auth.uid() = id and auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Mentor Applications: private to applicant and admins
alter table public.mentor_applications enable row level security;

create policy "Users can view their own applications"
  on public.mentor_applications
  for select using (auth.uid() = user_id);

create policy "Users can create applications"
  on public.mentor_applications
  for insert with check (auth.uid() = user_id);

create policy "Admins can manage all applications"
  on public.mentor_applications
  for all using (
    exists (
      select 1 from auth.users
      where auth.uid() = id and auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Programs: public read, admin manage
alter table public.programs enable row level security;

create policy "Programs are viewable by everyone"
  on public.programs
  for select using (true);

create policy "Admins can manage programs"
  on public.programs
  for all using (
    exists (
      select 1 from auth.users
      where auth.uid() = id and auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Payments: private to user and admins
alter table public.payments enable row level security;

create policy "Users can view their own payments"
  on public.payments
  for select using (auth.uid() = user_id);

create policy "Users can create payments"
  on public.payments
  for insert with check (auth.uid() = user_id);

create policy "Admins can manage all payments"
  on public.payments
  for all using (
    exists (
      select 1 from auth.users
      where auth.uid() = id and auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Create storage buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('blog-images', 'blog-images', true),
  ('mentor-documents', 'mentor-documents', false);

-- Storage policies for avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Users can update their own avatar"
  on storage.objects for update
  using ( auth.uid()::text = (storage.foldername(name))[1] );

-- Storage policies for blog images
create policy "Blog images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'blog-images' );

create policy "Admins can upload blog images"
  on storage.objects for insert
  with check (
    bucket_id = 'blog-images' and
    exists (
      select 1 from auth.users
      where auth.uid() = id and auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Storage policies for mentor documents
create policy "Users can access their own documents"
  on storage.objects for select
  using ( 
    bucket_id = 'mentor-documents' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'mentor-documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );