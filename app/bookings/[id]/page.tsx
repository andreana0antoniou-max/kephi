import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import MessageThread from "@/components/MessageThread";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/bookings/${id}`)}`);

  const { data: booking } = await supabase
    .from("booking_requests")
    .select("*, entertainers(business_name, town)")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  const isParent = booking.parent_id === user.id;
  const isEntertainer = booking.entertainer_id === user.id;
  if (!isParent && !isEntertainer) notFound();

  const otherPartyName = isParent
    ? booking.entertainers?.business_name ?? "the entertainer"
    : booking.parent_name;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <Link href={isParent ? "/my-bookings" : "/dashboard/requests"} className="text-sm text-ink/60 hover:text-tangerine">
        &larr; Back
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="font-heading font-semibold text-2xl text-ink">
          {otherPartyName}
        </h1>
        <p className="text-ink/60 text-sm mt-1">
          {booking.event_date
            ? `Event date: ${booking.event_date}`
            : "No event date set yet"}
          {" · "}
          <span className="capitalize">{booking.status}</span>
        </p>
      </div>

      <MessageThread bookingRequestId={booking.id} />
    </div>
  );
}
