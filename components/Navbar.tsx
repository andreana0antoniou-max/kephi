import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { getUnreadBookingIds, getUserBookingIds } from "@/lib/unread";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEntertainer = false;
  let hasUnread = false;

  if (user) {
    const { data } = await supabase
      .from("entertainers")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    isEntertainer = !!data;

    const bookingIds = await getUserBookingIds(
      supabase,
      user.id,
      isEntertainer ? "entertainer" : "parent"
    );
    const unread = await getUnreadBookingIds(supabase, user.id, bookingIds);
    hasUnread = unread.size > 0;
  }

  const linkClass =
    "hover:text-tangerine transition-colors hidden sm:inline";

  return (
    <header className="bg-ink sticky top-0 z-40 shadow-md">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/kephi-mark-dark.png" alt="" width={42} height={42} className="rounded-lg" />
          <span className="font-heading font-semibold text-xl tracking-tight text-cream">
            Kephi
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold text-cream">
          <Link href="/" className="hover:text-tangerine transition-colors">
            Find entertainers
          </Link>

          {!user && (
            <Link href="/signup" className={linkClass}>
              List your act
            </Link>
          )}

          {user && isEntertainer && (
            <>
              <Link href="/dashboard" className={linkClass}>
                My Profile
              </Link>
              <Link
                href="/dashboard/requests"
                className={`${linkClass} flex items-center gap-1.5 ${hasUnread ? "font-extrabold text-white" : ""}`}
              >
                Booking Requests
                {hasUnread && <span className="w-2 h-2 rounded-full bg-tangerine" />}
              </Link>
            </>
          )}

          {user && !isEntertainer && (
            <>
              <Link href="/my-profile" className={linkClass}>
                My Profile
              </Link>
              <Link
                href="/my-bookings"
                className={`${linkClass} flex items-center gap-1.5 ${hasUnread ? "font-extrabold text-white" : ""}`}
              >
                My Bookings
                {hasUnread && <span className="w-2 h-2 rounded-full bg-tangerine" />}
              </Link>
              <Link href="/liked" className={linkClass}>
                Liked
              </Link>
            </>
          )}

          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-tangerine text-white hover:bg-white hover:text-ink transition-colors"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
