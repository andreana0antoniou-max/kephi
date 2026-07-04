import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/DashboardNav";
import { BookingRequest } from "@/lib/types";

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: requests } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("entertainer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <DashboardNav />
      <h1 className="font-heading font-semibold text-2xl text-ink mb-1">
        Booking requests
      </h1>
      <p className="text-ink/60 mb-8">
        Parents and organisers who've reached out about your act. Reply to
        them right here — keeping it in Kephi means there's always a record
        of the conversation.
      </p>

      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((r: BookingRequest) => (
            <Link
              key={r.id}
              href={`/bookings/${r.id}`}
              className="block bg-white rounded-kephi card-shadow p-5 hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-ink">
                  {r.parent_name}
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal/10 text-teal capitalize">
                  {r.status}
                </span>
              </div>
              {r.event_date && (
                <p className="text-sm text-ink/60 mt-1">
                  Event date: {r.event_date}
                </p>
              )}
              {r.message && (
                <p className="text-ink/80 mt-3 whitespace-pre-line line-clamp-2">
                  {r.message}
                </p>
              )}
              <p className="text-tangerine text-sm font-semibold mt-3">
                Open conversation &rarr;
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-ink/60">No booking requests yet.</p>
      )}
    </div>
  );
}
