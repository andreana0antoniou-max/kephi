-- Migration: require a logged-in account to submit a booking request
-- Run this in your Supabase project's SQL Editor (Dashboard > SQL Editor > New query)
-- Safe to run once on your existing live project.

-- 1. Add a column linking each booking request to the account that made it.
alter table booking_requests
  add column if not exists parent_id uuid references auth.users (id) on delete cascade;

-- 2. Drop the old policy that let anyone (logged in or not) submit a request.
drop policy if exists "Anyone can submit a booking request" on booking_requests;

-- 3. Replace it with a policy that requires the requester to be logged in,
--    and only ever insert a request as themselves.
create policy "Logged-in users can submit a booking request"
  on booking_requests for insert
  with check (auth.uid() = parent_id);

-- 4. Let parents see the booking requests they've sent (new — previously only
--    entertainers could see requests at all).
create policy "Parents can view their own sent requests"
  on booking_requests for select
  using (auth.uid() = parent_id);
