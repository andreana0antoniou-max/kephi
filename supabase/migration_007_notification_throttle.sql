-- Migration: throttle notification emails so a burst of activity (several
-- messages sent quickly, or rapid like/unlike) only sends one email, not
-- one per event.
-- Run this in your Supabase project's SQL Editor.

create table if not exists notification_log (
  subject_id uuid not null,
  recipient_id uuid not null,
  kind text not null,
  last_notified_at timestamptz not null default now(),
  primary key (subject_id, recipient_id, kind)
);

alter table notification_log enable row level security;

-- Deliberately no policies added — this table is only ever read/written by
-- the server-side admin client (using the service role key), which
-- bypasses RLS entirely. No one else needs, or should have, access to it.
