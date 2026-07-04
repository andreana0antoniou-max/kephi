-- Migration: reviews only after a confirmed booking, auto-calendar-block
-- Run this in your Supabase project's SQL Editor.

-- 1. Public reviews a parent leaves for an entertainer ----------------------
create table if not exists entertainer_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references booking_requests (id) on delete cascade,
  entertainer_id uuid not null references entertainers (id) on delete cascade,
  parent_id uuid not null references auth.users (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz default now(),
  unique (booking_request_id)
);

alter table entertainer_reviews enable row level security;

create policy "Reviews are publicly viewable"
  on entertainer_reviews for select
  using (true);

-- Only the parent on a CONFIRMED booking can review that entertainer —
-- this is what stops made-up reviews from people who never booked.
create policy "Parents can review after a confirmed booking"
  on entertainer_reviews for insert
  with check (
    auth.uid() = parent_id
    and exists (
      select 1 from booking_requests br
      where br.id = entertainer_reviews.booking_request_id
        and br.parent_id = auth.uid()
        and br.entertainer_id = entertainer_reviews.entertainer_id
        and br.status = 'booked'
    )
  );

-- 2. Tighten entertainer notes-about-a-parent the same way -----------------
drop policy if exists "Entertainers can leave a note about a parent they've booked with" on parent_notes;

create policy "Entertainers can leave a note after a confirmed booking"
  on parent_notes for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from booking_requests br
      where br.parent_id = parent_notes.parent_id
        and br.entertainer_id = parent_notes.author_id
        and br.status = 'booked'
    )
  );

-- 3. Auto-mark the entertainer's calendar unavailable once a date is
--    confirmed, without them having to do it manually. Runs as a trigger
--    so it works no matter which side accepted the offer.
create or replace function sync_unavailable_date_on_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'booked' and new.event_date is not null then
    insert into unavailable_dates (entertainer_id, date)
    values (new.entertainer_id, new.event_date)
    on conflict (entertainer_id, date) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists booking_confirmed_marks_unavailable on booking_requests;

create trigger booking_confirmed_marks_unavailable
after update on booking_requests
for each row
when (
  new.status = 'booked'
  and (old.status is distinct from new.status or old.event_date is distinct from new.event_date)
)
execute function sync_unavailable_date_on_booking();
