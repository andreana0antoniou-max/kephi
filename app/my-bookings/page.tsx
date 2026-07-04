import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/my-bookings");

  const { data: bookings } = await supabase
    .from("booking_requests")
    .select("*, entertainers(business_name, town)")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
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
              className="block bg-white rounded-kephi card-shadow p-5 hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-ink">
                  {b.entertainers?.business_name ?? "Entertainer"}
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal/10 text-teal capitalize">
                  {b.status}
                </span>
              </div>
              <p className="text-sm text-ink/60 mt-1">
                {b.entertainers?.town}
                {b.event_date ? ` · Event date: ${b.event_date}` : ""}
              </p>
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
