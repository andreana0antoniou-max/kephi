-- Migration: likes, parent notes, and message read-tracking
-- Run this in your Supabase project's SQL Editor.

-- 1. Likes — parents can like entertainer profiles -------------------------
create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  entertainer_id uuid not null references entertainers (id) on delete cascade,
  created_at timestamptz default now(),
  unique (parent_id, entertainer_id)
);

alter table likes enable row level security;

create policy "Users can view their own likes"
  on likes for select
  using (auth.uid() = parent_id);

create policy "Users can like as themselves"
  on likes for insert
  with check (auth.uid() = parent_id);

create policy "Users can remove their own likes"
  on likes for delete
  using (auth.uid() = parent_id);

-- 2. Notes an entertainer can leave about a parent they've booked with -----
create table if not exists parent_notes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table parent_notes enable row level security;

create policy "Parents can view notes about themselves"
  on parent_notes for select
  using (auth.uid() = parent_id or auth.uid() = author_id);

create policy "Entertainers can leave a note about a parent they've booked with"
  on parent_notes for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from booking_requests br
      where br.parent_id = parent_notes.parent_id
        and br.entertainer_id = parent_notes.author_id
    )
  );

-- 3. Read-tracking, so unread messages can be shown with a dot -------------
create table if not exists message_reads (
  booking_request_id uuid not null references booking_requests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (booking_request_id, user_id)
);

alter table message_reads enable row level security;

create policy "Users can view their own read receipts"
  on message_reads for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own read receipts"
  on message_reads for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own read receipts"
  on message_reads for update
  using (auth.uid() = user_id);
