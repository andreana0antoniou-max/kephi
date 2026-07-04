"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({
  bookingRequestId,
  entertainerId,
  parentId,
  entertainerName,
}: {
  bookingRequestId: string;
  entertainerId: string;
  parentId: string;
  entertainerName: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Pick a star rating first.");
      return;
    }
    setSaving(true);
    setError(null);

    const { error } = await supabase.from("entertainer_reviews").insert({
      booking_request_id: bookingRequestId,
      entertainer_id: entertainerId,
      parent_id: parentId,
      rating,
      body: body.trim() || null,
    });

    setSaving(false);
    if (error) {
      setError("Something went wrong — please try again.");
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-kephi card-shadow p-5 space-y-3">
      <p className="font-semibold text-ink">Leave a review for {entertainerName}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl leading-none"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            {n <= (hoverRating || rating) ? "★" : "☆"}
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How did it go? (optional)"
        rows={3}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
      />
      {error && <p className="text-plum text-sm font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-full px-5 py-2 bg-tangerine text-white text-sm font-bold hover:bg-ink transition-colors disabled:opacity-60"
      >
        {saving ? "Saving..." : "Submit review"}
      </button>
    </form>
  );
}
