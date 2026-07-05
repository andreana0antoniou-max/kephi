# Kephi — starter codebase

## Update: fixed the burst-notification limitation

Run `supabase/migration_007_notification_throttle.sql` and push. No new
env vars needed this time.

What changed: a burst of messages sent quickly now only emails the
recipient once, not once per message — there's a 5-minute cooldown per
conversation before another email will go out. Rapid like/unlike clicking
is protected the same way, with a 30-minute cooldown per person liking.

## Update: email notifications

This one needs two new secret keys added — nothing to run in Supabase's SQL
Editor this time, but real setup is needed before it works.

**1. Add two new values to `.env.local` (and to Vercel's Environment
Variables, same as the others):**

```
RESEND_API_KEY=re_your_real_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

- `RESEND_API_KEY` — the key you already created in Resend.
- `SUPABASE_SERVICE_ROLE_KEY` — a *different* key from the one you've been
  using. In Supabase: **Project Settings → API → API Keys**, look for
  **service_role** / **secret** (not the `anon`/`publishable` one you
  already have). This key is powerful — it bypasses all the security rules
  — so it only ever gets used in server-only code, never sent to a browser.
  Guard it the same way you guard your Stripe secret key.

**2. Push the code** — same as always.

**What's new:**
- Entertainers get an email when: someone sends them a message, a new
  booking request comes in, or someone likes their profile.
- Parents get an email when an entertainer replies to a message.
- Everyone can turn each of these on/off individually from their profile
  page — nothing is forced on people.
- Emails come from `notifications@kephi.uk`, using the domain you already
  verified with Resend.

**Known limitation, on purpose for now:** sending a burst of messages
quickly will email the recipient every time, not just once. Fine at low
volume; worth revisiting if conversations get busy.

## Update: nav restructure, reviews, dark navbar, auto-calendar-block

If you've already deployed:

1. **Run a migration** — `supabase/migration_006_reviews_and_autoblock.sql`.
2. **Push the code**.

What's new:
- **Navigation restructure**: "Booking Requests" / "My Bookings" are now
  top-level nav links next to "My Profile" — no longer nested inside the
  profile page. They show a dot and go bold when there's an unread message
  anywhere in that person's conversations.
- **Reviews**: parents can leave a public star rating + review on an
  entertainer's profile, but only after a booking is actually confirmed
  (status = "booked") — not before, and not from anyone who never booked.
  Same confirmed-booking rule now applies to the entertainer's notes about
  a parent.
- **Auto-calendar-block**: once a date is confirmed through the in-chat
  offer flow, it's automatically added to the entertainer's unavailable
  dates — no manual step needed. This runs as a database trigger, so it
  works no matter which side accepted.
- **Navbar redesign**: dark background for real contrast against the cream
  page (this was blending in before), using your actual logo file
  recomposited onto the dark background rather than a redrawn version.

**Not addressed yet, flagged for a closer look:**
- The "feels empty" feedback — I made one concrete change (star ratings
  now show on entertainer profiles, which adds some visual weight), but
  I'd like a screenshot of the specific page/section that feels sparse
  before guessing further.
- Cancellation policy tiers — this depends on payments existing, so it's
  bundled into the Stripe build whenever that's ready.

## Update: availability + book-a-date-in-chat

If you've already deployed:

1. **Run a migration** — `supabase/migration_005_availability_and_offers.sql`.
2. **Push the code**.

What's new:
- Entertainers can mark dates they're unavailable, from their **My Profile**
  page.
- Inside a booking's chat, either side can **propose a date**. The other
  side sees Accept/Decline. Accepting locks it in — the booking shows
  "✓ Booked for [date]" everywhere it appears (booking lists, the chat
  itself). If a parent proposes a date the entertainer's already marked
  unavailable, they get a gentle heads-up but can still send it.

**Still queued, waiting on you:**
- Email notifications — needs an email service (e.g. Resend) set up first.
- Payments — needs your Stripe account set up first.

## Update: likes, notes, unread indicators, nav cleanup

If you've already deployed:

1. **Run a migration** — `supabase/migration_004_likes_notes_unread.sql`, same
   process as before.
2. **Push the code**.

What's new:
- Sending a booking request now drops you straight into the chat — no more
  "the entertainer will reply to your email."
- Parents can like entertainer profiles (heart icon) and see everything
  they've liked on a new **Liked** page.
- The navbar logo is bigger, and "Dashboard" is now labelled **My Profile**.
- Parents now have their own **My Profile** page — showing their account
  and a section for notes entertainers have left about them after a
  booking (visible only to that parent and the entertainer who wrote it).
- Booking lists (both sides) show a small dot next to any conversation with
  unread messages.
- In a parent's view of a conversation, the entertainer's photo now shows
  next to their name.

**Not yet built, on purpose:**
- **Entertainer availability calendars** and an in-chat "propose a date /
  accept it / it's booked" flow — bigger pieces, coming next.
- **Email notifications** (for new messages, likes, etc.) — needs an email
  sending service (e.g. Resend) set up first, same as Stripe for payments.

## Update: in-app messaging + entertainer photo galleries

Two more things need action if you've already deployed:

1. **Run a second migration in Supabase** — same process as before: SQL
   Editor → New query → paste in the entire contents of
   `supabase/migration_003_messaging_and_galleries.sql` → Run.
2. **Push the updated code** — `git add .`, `git commit -m "..."`, `git push`.

What's new:
- Parents and entertainers now talk **inside Kephi** — once a booking
  request is sent, both sides land on a shared conversation page
  (`/bookings/[id]`) instead of emailing each other. Messages appear live
  without refreshing.
- Parents now have their own `/my-bookings` page to see everything they've
  sent and jump back into a conversation.
- Entertainers can add extra photos to their profile — a gallery beyond the
  single profile picture — from their dashboard. Shown on their public
  profile under their bio.

## Update: accounts now required to book (read this if you already deployed)

If you've already set up Supabase and deployed once, two things changed that
need action on your end:

1. **Run a migration in Supabase.** Open your Supabase project → **SQL
   Editor** → **New query**, paste in the entire contents of
   `supabase/migration_002_require_login_to_book.sql`, and click **Run**.
   This adds the new database rule and doesn't touch any existing data.
2. **Push the updated code** — `git add .`, `git commit -m "..."`, `git push`
   — same as before. Vercel redeploys automatically.

What changed in the app itself:
- Browsing, searching, and viewing entertainer profiles is still fully
  public — no account needed.
- Sending a booking request now requires being logged in. Visitors who
  aren't logged in see a prompt to log in or create a free account instead
  of the booking form.
- There are now two kinds of accounts: **entertainers** (via `/signup`,
  same as before — leads to building a profile) and **parents/organisers**
  (via the new `/signup/parent` — just name, email, password, no profile to
  build). Which one someone has is simply based on whether they have a row
  in the `entertainers` table, not a separate "role" field.
- The navbar now reflects whether you're logged in (shows **Log out** and,
  for entertainers, a **Dashboard** link) instead of always showing "Log in."

---

A working Next.js + Supabase MVP for the Kephi entertainer marketplace, styled
with your brand (Fredoka/Nunito, jewel-tone accents, cream background).

## What's built

- **Browse & search** (`/`) — filter entertainers by type and town
- **Entertainer profile pages** (`/entertainers/[id]`) — photo, bio, price,
  location, and a booking request form (no account needed to enquire)
- **Sign up / log in** (`/signup`, `/login`) — Supabase email/password auth
  for entertainers
- **Dashboard** (`/dashboard`) — entertainers create/edit their profile and
  upload a photo
- **Booking requests inbox** (`/dashboard/requests`) — entertainers see who's
  contacted them
- No payments — as scoped

This is real, working code, not a mockup. You'll need to connect it to your
own Supabase project and run it, following the steps below.

## Before you start

Install two things on your computer if you don't have them already:

1. **Node.js** (v20 or later) — download from [nodejs.org](https://nodejs.org)
2. **A code editor** — [VS Code](https://code.visualstudio.com) is the
   standard choice

You'll also want a free [GitHub](https://github.com) account (to store the
code and connect it to Vercel) and a free [Supabase](https://supabase.com)
account (the database + auth).

## Step 1 — Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Pick a name (e.g. `kephi`), a database password (save it somewhere safe),
   and a region close to the UK (e.g. `eu-west-2 London` or `eu-west-1`).
3. Once it's created, go to **SQL Editor** → **New query**, paste in the
   entire contents of `supabase/schema.sql` from this project, and click
   **Run**. This creates your `entertainers` and `booking_requests` tables,
   sets up the security rules, and creates a storage bucket for photos.
4. Go to **Project Settings → API**. You'll need two values from here in the
   next step: the **Project URL** and the **anon public** key.

## Step 2 — Configure the project locally

1. Unzip this project and open the folder in VS Code.
2. Open a terminal in that folder and run:
   ```
   npm install
   ```
3. Copy `.env.local.example` to a new file called `.env.local`, and paste in
   your Project URL and anon key from Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Run the dev server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) — you should see
   Kephi running. Try signing up as an entertainer, filling in a profile,
   then browsing the homepage to see it appear.

## Step 3 — Put it on GitHub

1. Create a new, empty repository on GitHub (don't add a README there).
2. In your terminal, inside the project folder:
   ```
   git init
   git add .
   git commit -m "Kephi MVP"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/kephi.git
   git push -u origin main
   ```
   (`.env.local` is excluded automatically by `.gitignore`, so your Supabase
   keys won't be uploaded — that's expected and correct.)

## Step 4 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **New
   Project** → import your `kephi` repo.
2. Before deploying, add your environment variables (same two values from
   Step 2) under **Environment Variables**.
3. Click **Deploy**. In a minute or two you'll have a live URL.

## Step 5 — Connect kephi.uk

1. In Vercel, open your project → **Settings → Domains** → add `kephi.uk`
   (and `www.kephi.uk` if you want that too).
2. Vercel will show you DNS records to add. Go to Namecheap → Domain List →
   Manage → Advanced DNS, and add the records Vercel gives you (usually an
   `A` record for the root domain and a `CNAME` for `www`).
3. DNS + SSL can take anywhere from a few minutes to a few hours to
   propagate.

## What's intentionally left for you to extend

- **Image search/filter by distance** — currently location search is a
  simple text match on town name.
- **Email notifications** — right now a booking request just saves to the
  database; the entertainer has to check `/dashboard/requests`. Adding email
  alerts (e.g. via Resend) is a natural next step.
- **Reviews/ratings** — not in this MVP scope.
- **Payments** — explicitly out of scope for now, as agreed.

## A note on continuing to build this

This starter is meant to get you unstuck and give you something real to run,
not to be the last version of Kephi. As you keep building — adding features,
fixing bugs, wiring up new pages — you'll get the most out of working in an
environment built for exactly that: a local project, a terminal, and an AI
that can read and edit the whole codebase directly. That's a better fit for
ongoing development than pasting code back and forth in chat.
