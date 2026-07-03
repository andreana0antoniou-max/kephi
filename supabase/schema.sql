-- Kephi database schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor > New query)

-- 1. Entertainer profiles ---------------------------------------------------
create table if not exists entertainers (
  id uuid primary key references auth.users (id) on delete cascade,
  business_name text not null,
  entertainer_type text not null,
  bio text,
  price_from numeric,
  price_unit text default 'per event', -- 'per hour' | 'per event'
  town text not null,
  region text, -- e.g. North West, London, Scotland
  contact_email text not null,
  contact_phone text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table entertainers enable row level security;

-- Anyone (including signed-out visitors) can browse entertainer profiles.
create policy "Entertainer profiles are publicly viewable"
  on entertainers for select
  using (true);

-- Entertainers can only create/edit/delete their own profile.
create policy "Entertainers can insert their own profile"
  on entertainers for insert
  with check (auth.uid() = id);

create policy "Entertainers can update their own profile"
  on entertainers for update
  using (auth.uid() = id);

create policy "Entertainers can delete their own profile"
  on entertainers for delete
  using (auth.uid() = id);

-- 2. Booking requests --------------------------------------------------------
create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),
  entertainer_id uuid not null references entertainers (id) on delete cascade,
  parent_name text not null,
  parent_email text not null,
  parent_phone text,
  event_date date,
  message text,
  status text default 'new', -- 'new' | 'replied' | 'booked' | 'declined'
  created_at timestamptz default now()
);

alter table booking_requests enable row level security;

-- Anyone can submit a booking request (no account required for parents).
create policy "Anyone can submit a booking request"
  on booking_requests for insert
  with check (true);

-- Only the entertainer being contacted can read their own requests.
create policy "Entertainers can view their own booking requests"
  on booking_requests for select
  using (auth.uid() = entertainer_id);

create policy "Entertainers can update status on their own requests"
  on booking_requests for update
  using (auth.uid() = entertainer_id);

-- 3. Storage for profile photos ---------------------------------------------
insert into storage.buckets (id, name, public)
values ('entertainer-photos', 'entertainer-photos', true)
on conflict (id) do nothing;

create policy "Entertainer photos are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'entertainer-photos');

create policy "Entertainers can upload their own photo"
  on storage.objects for insert
  with check (
    bucket_id = 'entertainer-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Entertainers can update their own photo"
  on storage.objects for update
  using (
    bucket_id = 'entertainer-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
