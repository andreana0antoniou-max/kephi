import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MessageThread from "@/components/MessageThread";
import ParentNoteForm from "@/components/ParentNoteForm";
import BookingOfferPanel from "@/components/BookingOfferPanel";
import ReviewForm from "@/components/ReviewForm";

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
    .select("*, entertainers(business_name, town, photo_url)")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  const isParent = booking.parent_id === user.id;
  const isEntertainer = booking.entertainer_id === user.id;
  if (!isParent && !isEntertainer) notFound();

  const isBooked = booking.status === "booked";

  const { data: unavailable } = await supabase
    .from("unavailable_dates")
    .select("date")
    .eq("entertainer_id", booking.entertainer_id);

  const { data: existingReview } = await supabase
    .from("entertainer_reviews")
    .select("*")
    .eq("booking_request_id", booking.id)
    .maybeSingle();

  const otherPartyName = isParent
    ? booking.entertainers?.business_name ?? "the entertainer"
    : booking.parent_name;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <Link href={isParent ? "/my-bookings" : "/dashboard/requests"} className="text-sm text-ink/60 hover:text-tangerine">
        &larr; Back
      </Link>

      <div className="mt-4 mb-6 flex items-center gap-4">
        {isParent && (
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-ink/5 flex-shrink-0">
            {booking.entertainers?.photo_url ? (
              <Image
                src={booking.entertainers.photo_url}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink/30 font-heading text-xl">
                {otherPartyName.charAt(0)}
              </div>
            )}
          </div>
        )}
        <div>
          <h1 className="font-heading font-semibold text-2xl text-ink">
            {otherPartyName}
          </h1>
        </div>
      </div>

      <BookingOfferPanel
        bookingRequestId={booking.id}
        currentUserId={user.id}
        bookingStatus={booking.status}
        bookingEventDate={booking.event_date}
        unavailableDates={(unavailable ?? []).map((u) => u.date)}
      />

      <MessageThread bookingRequestId={booking.id} />

      {/* Notes and reviews only unlock once a date's actually confirmed —
          stops anyone leaving feedback without a real booking behind it. */}
      {isEntertainer && isBooked && (
        <div className="mt-4">
          <ParentNoteForm parentId={booking.parent_id} parentName={booking.parent_name} />
        </div>
      )}

      {isParent && isBooked && (
        <div className="mt-4">
          {existingReview ? (
            <div className="bg-white rounded-kephi card-shadow p-5">
              <p className="font-semibold text-ink mb-1">
                {"★".repeat(existingReview.rating)}
                {"☆".repeat(5 - existingReview.rating)}
              </p>
              {existingReview.body && (
                <p className="text-ink/70 whitespace-pre-line">{existingReview.body}</p>
              )}
              <p className="text-xs text-ink/40 mt-2">Your review — thanks!</p>
            </div>
          ) : (
            <ReviewForm
              bookingRequestId={booking.id}
              entertainerId={booking.entertainer_id}
              parentId={user.id}
              entertainerName={otherPartyName}
            />
          )}
        </div>
      )}
    </div>
  );
}
