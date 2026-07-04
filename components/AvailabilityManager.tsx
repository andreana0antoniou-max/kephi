"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UnavailableDate } from "@/lib/types";

export default function AvailabilityManager({
  userId,
  initialDates,
}: {
  userId: string;
  initialDates: UnavailableDate[];
}) {
  const supabase = createClient();
  const [dates, setDates] = useState<UnavailableDate[]>(initialDates);
  const [newDate, setNewDate] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("unavailable_dates")
      .insert({ entertainer_id: userId, date: newDate })
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      setDates((prev) => [...prev, data]);
      setNewDate("");
    }
  }

  async function handleRemove(id: string) {
    await supabase.from("unavailable_dates").delete().eq("id", id);
    setDates((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="pt-6 border-t border-ink/10">
      <h2 className="font-heading font-semibold text-lg text-ink mb-1">
        Availability
      </h2>
      <p className="text-sm text-ink/60 mb-4">
        Mark dates you're already booked or unavailable — parents will see a
        heads-up if they try to propose one of these when booking with you.
      </p>

      {sorted.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {sorted.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-2 bg-ink/5 text-ink text-sm rounded-full px-3 py-1.5"
            >
              {new Date(d.date + "T00:00:00").toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              <button
                type="button"
                onClick={() => handleRemove(d.id)}
                className="text-ink/40 hover:text-plum font-bold"
                aria-label="Remove date"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="rounded-full border border-ink/10 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
        <button
          type="submit"
          disabled={saving || !newDate}
          className="rounded-full px-4 py-2 border border-ink/15 text-ink text-sm font-semibold hover:bg-ink/5 transition-colors disabled:opacity-50"
        >
          {saving ? "Adding..." : "Mark unavailable"}
        </button>
      </form>
    </div>
  );
}
