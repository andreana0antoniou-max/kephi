-- Migration: entertainer availability + in-chat date offers
-- Run this in your Supabase project's SQL Editor.

-- 1. Dates an entertainer has marked as unavailable ------------------------
create table if not exists unavailable_dates (
  id uuid primary key default gen_random_uuid(),
  entertainer_id uuid not null references entertainers (id) on delete cascade,
  date date not null,
  created_at timestamptz default now(),
  unique (entertainer_id, date)
);

alter table unavailable_dates enable row level security;

create policy "Unavailable dates are publicly viewable"
  on unavailable_dates for select
  using (true);

create policy "Entertainers can mark their own dates unavailable"
  on unavailable_dates for insert
  with check (auth.uid() = entertainer_id);

create policy "Entertainers can remove their own unavailable dates"
  on unavailable_dates for delete
  using (auth.uid() = entertainer_id);

-- 2. Date offers within a booking's chat — propose / accept / decline -----
create table if not exists booking_offers (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references booking_requests (id) on delete cascade,
  proposed_by uuid not null references auth.users (id) on delete cascade,
  proposed_date date not null,
  status text not null default 'pending', -- 'pending' | 'accepted' | 'declined'
  created_at timestamptz default now()
);

alter table booking_offers enable row level security;

create policy "Participants can view offers on their booking"
  on booking_offers for select
  using (
    exists (
      select 1 from booking_requests br
      where br.id = booking_offers.booking_request_id
        and (br.parent_id = auth.uid() or br.entertainer_id = auth.uid())
    )
  );

create policy "Participants can propose a date"
  on booking_offers for insert
  with check (
    proposed_by = auth.uid()
    and exists (
      select 1 from booking_requests br
      where br.id = booking_offers.booking_request_id
        and (br.parent_id = auth.uid() or br.entertainer_id = auth.uid())
    )
  );

create policy "The other participant can accept or decline"
  on booking_offers for update
  using (
    proposed_by != auth.uid()
    and exists (
      select 1 from booking_requests br
      where br.id = booking_offers.booking_request_id
        and (br.parent_id = auth.uid() or br.entertainer_id = auth.uid())
    )
  );

alter publication supabase_realtime add table booking_offers;

-- 3. Parents need to be able to confirm a booking too (previously only
--    entertainers could update booking_requests — needed when a parent
--    accepts a date the entertainer proposed).
create policy "Parents can update their own booking requests"
  on booking_requests for update
  using (auth.uid() = parent_id);
