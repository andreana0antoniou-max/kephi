import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ParentNav from "@/components/ParentNav";
import { getUnreadBookingIds } from "@/lib/unread";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/my-bookings");

  const { data: bookings } = await supabase
    .from("booking_requests")
    .select("*, entertainers(business_name, town, photo_url)")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false });

  const unread = await getUnreadBookingIds(
    supabase,
    user.id,
    (bookings ?? []).map((b) => b.id)
  );

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <ParentNav />
      <h1 className="font-heading font-semibold text-2xl text-ink mb-1">
        My bookings
      </h1>
      <p className="text-ink/60 mb-8">
        Entertainers you've reached out to, and your conversations with them.
      </p>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="flex items-center gap-4 bg-white rounded-kephi card-shadow p-5 hover:-translate-y-0.5 transition-transform"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-ink/5 flex-shrink-0">
                {b.entertainers?.photo_url ? (
                  <Image
                    src={b.entertainers.photo_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/30 font-heading">
                    {(b.entertainers?.business_name ?? "?").charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-ink flex items-center gap-2">
                    {b.entertainers?.business_name ?? "Entertainer"}
                    {unread.has(b.id) && (
                      <span className="w-2 h-2 rounded-full bg-tangerine" />
                    )}
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal/10 text-teal capitalize">
                    {b.status}
                  </span>
                </div>
                <p className="text-sm text-ink/60 mt-1">
                  {b.entertainers?.town}
                  {b.event_date ? ` · Event date: ${b.event_date}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-ink/60">
          You haven't sent any booking requests yet.{" "}
          <Link href="/" className="text-tangerine font-semibold">
            Find an entertainer
          </Link>
          .
        </p>
      )}
    </div>
  );
}
