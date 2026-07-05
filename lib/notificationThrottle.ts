import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns true if a notification should actually be sent, and records that
 * it was sent. If one was already sent for this exact (subject, recipient,
 * kind) combination within the cooldown window, returns false so the
 * caller skips sending — this is what stops a burst of messages, or rapid
 * like/unlike clicking, from emailing someone once per event.
 */
export async function shouldSendNotification(
  admin: SupabaseClient,
  {
    subjectId,
    recipientId,
    kind,
    cooldownMinutes = 5,
  }: {
    subjectId: string;
    recipientId: string;
    kind: string;
    cooldownMinutes?: number;
  }
): Promise<boolean> {
  const { data: existing } = await admin
    .from("notification_log")
    .select("last_notified_at")
    .eq("subject_id", subjectId)
    .eq("recipient_id", recipientId)
    .eq("kind", kind)
    .maybeSingle();

  const now = new Date();

  if (existing?.last_notified_at) {
    const minutesSince = (now.getTime() - new Date(existing.last_notified_at).getTime()) / 60000;
    if (minutesSince < cooldownMinutes) return false;
  }

  await admin.from("notification_log").upsert(
    {
      subject_id: subjectId,
      recipient_id: recipientId,
      kind,
      last_notified_at: now.toISOString(),
    },
    { onConflict: "subject_id,recipient_id,kind" }
  );

  return true;
}
