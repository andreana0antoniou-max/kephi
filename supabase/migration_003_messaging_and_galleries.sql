-- Migration: in-app messaging + entertainer photo galleries
-- Run this in your Supabase project's SQL Editor.
-- Safe to run once on your existing live project.

-- 1. Messages, tied to a specific booking request ---------------------------
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references booking_requests (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table messages enable row level security;

-- Only the parent and the entertainer on a given booking can see the thread.
create policy "Participants can view messages on their booking"
  on messages for select
  using (
    exists (
      select 1 from booking_requests br
      where br.id = messages.booking_request_id
        and (br.parent_id = auth.uid() or br.entertainer_id = auth.uid())
    )
  );

-- Only those same two people can post into it, and only as themselves.
create policy "Participants can send messages on their booking"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from booking_requests br
      where br.id = messages.booking_request_id
        and (br.parent_id = auth.uid() or br.entertainer_id = auth.uid())
    )
  );

-- Enable realtime so messages appear live without refreshing.
alter publication supabase_realtime add table messages;

-- 2. Entertainer photo galleries ---------------------------------------------
create table if not exists entertainer_photos (
  id uuid primary key default gen_random_uuid(),
  entertainer_id uuid not null references entertainers (id) on delete cascade,
  photo_url text not null,
  created_at timestamptz default now()
);

alter table entertainer_photos enable row level security;

create policy "Entertainer gallery photos are publicly viewable"
  on entertainer_photos for select
  using (true);

create policy "Entertainers can add their own gallery photos"
  on entertainer_photos for insert
  with check (auth.uid() = entertainer_id);

create policy "Entertainers can delete their own gallery photos"
  on entertainer_photos for delete
  using (auth.uid() = entertainer_id);

-- Note: no new storage policies needed — the existing "entertainer-photos"
-- bucket policies already allow a user to upload/manage anything under
-- their own folder path, which gallery photos will also use.
