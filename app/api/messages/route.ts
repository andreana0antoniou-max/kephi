import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotificationEmail } from "@/lib/email";
import { shouldSendNotification } from "@/lib/notificationThrottle";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { bookingRequestId, body } = await request.json();
  if (!bookingRequestId || !body?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Insert as the logged-in user — RLS still applies here since this uses
  // the normal session-scoped client, not the admin one.
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      booking_request_id: bookingRequestId,
      sender_id: user.id,
      body: body.trim(),
    })
    .select()
    .single();

  if (error || !message) {
    return NextResponse.json({ error: error?.message ?? "Failed to send" }, { status: 400 });
  }

  // Fire the notification email in the background — never block the
  // response on this, and never let it fail the actual send.
  notifyOtherParty(bookingRequestId, user.id).catch((err) =>
    console.error("notifyOtherParty failed:", err)
  );

  return NextResponse.json({ message });
}

async function notifyOtherParty(bookingRequestId: string, senderId: string) {
  const admin = createAdminClient();

  const { data: booking } = await admin
    .from("booking_requests")
    .select("parent_id, entertainer_id, parent_name, entertainers(business_name)")
    .eq("id", bookingRequestId)
    .single();

  if (!booking) return;

  const recipientId = booking.parent_id === senderId ? booking.entertainer_id : booking.parent_id;
  const senderName =
    booking.parent_id === senderId
      ? booking.parent_name
      : (booking.entertainers as unknown as { business_name: string } | null)?.business_name ?? "Someone";

  const { data: recipient } = await admin.auth.admin.getUserById(recipientId);
  if (!recipient?.user?.email) return;

  const notifyMessages = recipient.user.user_metadata?.notify_messages;
  if (notifyMessages === false) return; // default is on unless explicitly turned off

  const shouldSend = await shouldSendNotification(admin, {
    subjectId: bookingRequestId,
    recipientId,
    kind: "message",
  });
  if (!shouldSend) return; // already emailed about this conversation recently

  await sendNotificationEmail({
    to: recipient.user.email,
    subject: `New message from ${senderName} on Kephi`,
    heading: `${senderName} sent you a message`,
    body: `You've got a new message waiting on Kephi. Open the conversation to reply.`,
    ctaLabel: "Open conversation",
    ctaUrl: `https://kephi.uk/bookings/${bookingRequestId}`,
  });
}
