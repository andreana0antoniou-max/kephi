"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Prefs = {
  notify_messages: boolean;
  notify_bookings?: boolean;
  notify_likes?: boolean;
};

export default function NotificationSettings({
  initial,
  showBookingsAndLikes,
}: {
  initial: Prefs;
  showBookingsAndLikes: boolean;
}) {
  const supabase = createClient();
  const [prefs, setPrefs] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function toggle(key: keyof Prefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    setSaved(false);

    const { error } = await supabase.auth.updateUser({ data: next });

    setSaving(false);
    if (!error) setSaved(true);
  }

  const Row = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label className="flex items-start gap-3 py-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 w-4 h-4 accent-tangerine"
      />
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-ink/50">{description}</p>
      </div>
    </label>
  );

  return (
    <div className="pt-6 border-t border-ink/10">
      <h2 className="font-heading font-semibold text-lg text-ink mb-1">
        Email notifications
      </h2>
      <p className="text-sm text-ink/60 mb-2">
        Choose what you'd like an email about. You'll always see everything
        in Kephi either way — this just controls email alerts.
      </p>

      <div className="divide-y divide-ink/5">
        <Row
          label="New messages"
          description="When someone sends you a message in a booking conversation."
          checked={prefs.notify_messages}
          onChange={() => toggle("notify_messages")}
        />
        {showBookingsAndLikes && (
          <>
            <Row
              label="New booking requests"
              description="When a parent sends you a new booking request."
              checked={prefs.notify_bookings ?? true}
              onChange={() => toggle("notify_bookings")}
            />
            <Row
              label="Likes on your profile"
              description="When a parent likes your entertainer profile."
              checked={prefs.notify_likes ?? true}
              onChange={() => toggle("notify_likes")}
            />
          </>
        )}
      </div>

      {saving && <p className="text-xs text-ink/40 mt-2">Saving...</p>}
      {saved && !saving && <p className="text-xs text-teal mt-2">Saved</p>}
    </div>
  );
}
