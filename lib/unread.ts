import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Given a list of booking_request ids, returns the subset that have a
 * message newer than the user's last read time for that booking — i.e.
 * ones that should show an "unread" indicator. A booking's own latest
 * message being sent by the user themselves never counts as unread.
 */
export async function getUnreadBookingIds(
  supabase: SupabaseClient,
  userId: string,
  bookingIds: string[]
): Promise<Set<string>> {
  if (bookingIds.length === 0) return new Set();

  const [{ data: messages }, { data: reads }] = await Promise.all([
    supabase
      .from("messages")
      .select("booking_request_id, sender_id, created_at")
      .in("booking_request_id", bookingIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("message_reads")
      .select("booking_request_id, last_read_at")
      .eq("user_id", userId)
      .in("booking_request_id", bookingIds),
  ]);

  const lastReadMap = new Map<string, string>();
  (reads ?? []).forEach((r) => lastReadMap.set(r.booking_request_id, r.last_read_at));

  const latestSeen = new Set<string>();
  const unread = new Set<string>();

  (messages ?? []).forEach((m) => {
    // Messages are ordered newest-first, so the first time we see a
    // booking id, that's its latest message.
    if (latestSeen.has(m.booking_request_id)) return;
    latestSeen.add(m.booking_request_id);

    if (m.sender_id === userId) return;

    const lastRead = lastReadMap.get(m.booking_request_id);
    if (!lastRead || new Date(m.created_at) > new Date(lastRead)) {
      unread.add(m.booking_request_id);
    }
  });

  return unread;
}
