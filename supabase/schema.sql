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
  parent_id uuid not null references auth.users (id) on delete cascade,
  parent_name text not null,
  parent_email text not null,
  parent_phone text,
  event_date date,
  message text,
  status text default 'new', -- 'new' | 'replied' | 'booked' | 'declined'
  created_at timestamptz default now()
);

alter table booking_requests enable row level security;

-- Only a logged-in parent can submit a booking request, and only as themselves.
create policy "Logged-in users can submit a booking request"
  on booking_requests for insert
  with check (auth.uid() = parent_id);

-- Only the entertainer being contacted can read their own requests.
create policy "Entertainers can view their own booking requests"
  on booking_requests for select
  using (auth.uid() = entertainer_id);

-- Parents can view the requests they've sent.
create policy "Parents can view their own sent requests"
  on booking_requests for select
  using (auth.uid() = parent_id);

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

-- 4. Messages, tied to a specific booking request ---------------------------
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references booking_requests (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Participants can view messages on their booking"
  on messages for select
  using (
    exists (
      select 1 from booking_requests br
      where br.id = messages.booking_request_id
        and (br.parent_id = auth.uid() or br.entertainer_id = auth.uid())
    )
  );

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

alter publication supabase_realtime add table messages;

-- 5. Entertainer photo galleries ---------------------------------------------
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

-- 6. Likes — parents can like entertainer profiles -------------------------
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

-- 7. Notes an entertainer can leave about a parent they've booked with -----
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

-- 8. Read-tracking, so unread messages can be shown with a dot -------------
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

-- 9. Dates an entertainer has marked as unavailable ------------------------
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

-- 10. Date offers within a booking's chat — propose / accept / decline ----
create table if not exists booking_offers (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references booking_requests (id) on delete cascade,
  proposed_by uuid not null references auth.users (id) on delete cascade,
  proposed_date date not null,
  status text not null default 'pending',
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

create policy "Parents can update their own booking requests"
  on booking_requests for update
  using (auth.uid() = parent_id);

-- 11. Public reviews a parent leaves for an entertainer ---------------------
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

-- 12. Auto-mark the entertainer's calendar unavailable once a date is
--     confirmed, without them having to do it manually.
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

create trigger booking_confirmed_marks_unavailable
after update on booking_requests
for each row
when (
  new.status = 'booked'
  and (old.status is distinct from new.status or old.event_date is distinct from new.event_date)
)
execute function sync_unavailable_date_on_booking();
