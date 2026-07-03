"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BookingRequestForm({
  entertainerId,
}: {
  entertainerId: string;
}) {
  const supabase = createClient();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [form, setForm] = useState({
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    event_date: "",
    message: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const { error } = await supabase.from("booking_requests").insert({
      entertainer_id: entertainerId,
      parent_name: form.parent_name,
      parent_email: form.parent_email,
      parent_phone: form.parent_phone || null,
      event_date: form.event_date || null,
      message: form.message || null,
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-kephi bg-teal/10 text-teal p-5 font-semibold text-center">
        Request sent! The entertainer will reply to {form.parent_email} soon.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Your name"
          value={form.parent_name}
          onChange={(e) => update("parent_name", e.target.value)}
          className="rounded-full border border-ink/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
        <input
          required
          type="email"
          placeholder="Your email"
          value={form.parent_email}
          onChange={(e) => update("parent_email", e.target.value)}
          className="rounded-full border border-ink/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
        <input
          placeholder="Phone (optional)"
          value={form.parent_phone}
          onChange={(e) => update("parent_phone", e.target.value)}
          className="rounded-full border border-ink/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
        <input
          type="date"
          placeholder="Event date"
          value={form.event_date}
          onChange={(e) => update("event_date", e.target.value)}
          className="rounded-full border border-ink/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
      </div>
      <textarea
        placeholder="Tell them about your event..."
        value={form.message}
        onChange={(e) => update("message", e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full px-6 py-3 bg-tangerine text-white font-bold hover:bg-ink transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send booking request"}
      </button>
      {status === "error" && (
        <p className="text-plum text-sm font-semibold">
          Something went wrong — please try again.
        </p>
      )}
    </form>
  );
}
