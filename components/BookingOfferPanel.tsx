"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookingOffer } from "@/lib/types";

export default function BookingOfferPanel({
  bookingRequestId,
  currentUserId,
  bookingStatus,
  bookingEventDate,
  unavailableDates,
}: {
  bookingRequestId: string;
  currentUserId: string;
  bookingStatus: string;
  bookingEventDate: string | null;
  unavailableDates: string[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [offer, setOffer] = useState<BookingOffer | null>(null);
  const [proposing, setProposing] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("booking_offers")
      .select("*")
      .eq("booking_request_id", bookingRequestId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data && data.status === "pending") setOffer(data);
      });

    const channel = supabase
      .channel(`offers:${bookingRequestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_offers",
          filter: `booking_request_id=eq.${bookingRequestId}`,
        },
        (payload) => {
          const row = payload.new as BookingOffer;
          setOffer(row.status === "pending" ? row : null);
          if (row.status === "accepted") router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, bookingRequestId, router]);

  async function handlePropose(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    setBusy(true);

    const { data, error } = await supabase
      .from("booking_offers")
      .insert({
        booking_request_id: bookingRequestId,
        proposed_by: currentUserId,
        proposed_date: newDate,
      })
      .select()
      .single();

    setBusy(false);
    if (!error && data) {
      setOffer(data);
      setProposing(false);
      setNewDate("");
    }
  }

  async function handleRespond(accept: boolean) {
    if (!offer) return;
    setBusy(true);

    await supabase
      .from("booking_offers")
      .update({ status: accept ? "accepted" : "declined" })
      .eq("id", offer.id);

    if (accept) {
      await supabase
        .from("booking_requests")
        .update({ event_date: offer.proposed_date, status: "booked" })
        .eq("id", bookingRequestId);
    }

    setOffer(accept ? null : null);
    setBusy(false);
    router.refresh();
  }

  const formattedDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const proposedDateIsUnavailable = newDate && unavailableDates.includes(newDate);

  return (
    <div className="bg-white rounded-kephi card-shadow p-5 mb-4">
      {bookingStatus === "booked" && bookingEventDate ? (
        <p className="font-semibold text-teal flex items-center gap-2">
          ✓ Booked for {formattedDate(bookingEventDate)}
        </p>
      ) : offer ? (
        offer.proposed_by === currentUserId ? (
          <div>
            <p className="text-sm text-ink/70">
              You proposed{" "}
              <span className="font-semibold text-ink">
                {formattedDate(offer.proposed_date)}
              </span>{" "}
              — waiting for a response.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-ink/70 mb-3">
              They proposed{" "}
              <span className="font-semibold text-ink">
                {formattedDate(offer.proposed_date)}
              </span>
              . Does that work?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleRespond(true)}
                disabled={busy}
                className="rounded-full px-5 py-2 bg-teal text-white text-sm font-bold hover:bg-ink transition-colors disabled:opacity-60"
              >
                Accept
              </button>
              <button
                onClick={() => handleRespond(false)}
                disabled={busy}
                className="rounded-full px-5 py-2 border border-ink/15 text-ink text-sm font-semibold hover:bg-ink/5 transition-colors disabled:opacity-60"
              >
                Decline
              </button>
            </div>
          </div>
        )
      ) : proposing ? (
        <form onSubmit={handlePropose} className="space-y-3">
          <p className="text-sm font-semibold text-ink">Propose a date</p>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required
            className="rounded-full border border-ink/10 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tangerine"
          />
          {proposedDateIsUnavailable && (
            <p className="text-sm text-plum">
              Heads up — this entertainer has marked that date as
              unavailable. You can still propose it, but it may get
              declined.
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full px-5 py-2 bg-tangerine text-white text-sm font-bold hover:bg-ink transition-colors disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send proposal"}
            </button>
            <button
              type="button"
              onClick={() => setProposing(false)}
              className="rounded-full px-5 py-2 text-sm font-semibold text-ink/60 hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setProposing(true)}
          className="text-sm font-semibold text-tangerine hover:text-ink"
        >
          {bookingEventDate ? "Propose a new date" : "Propose a date"} &rarr;
        </button>
      )}
    </div>
  );
}
