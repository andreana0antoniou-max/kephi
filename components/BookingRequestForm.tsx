"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BookingRequestForm({
  entertainerId,
}: {
  entertainerId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "idle" | "sending" | "error">(
    "loading"
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    event_date: "",
    message: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setForm((prev) => ({
          ...prev,
          parent_name: (user.user_metadata?.name as string) ?? "",
          parent_email: user.email ?? "",
        }));
      }
      setStatus("idle");
    });
  }, [supabase]);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setStatus("sending");

    const res = await fetch("/api/booking-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entertainerId,
        parentName: form.parent_name,
        parentEmail: form.parent_email,
        parentPhone: form.parent_phone,
        eventDate: form.event_date,
        message: form.message,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.booking) {
      setStatus("error");
      return;
    }

    // Drop straight into the conversation — no more "we'll email you".
    router.push(`/bookings/${data.booking.id}`);
  }

  if (status === "loading") {
    return <div className="h-40" />;
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
          readOnly
          title="This is the email on your account"
          className="rounded-full border border-ink/10 px-4 py-2.5 bg-ink/5 text-ink/70"
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
