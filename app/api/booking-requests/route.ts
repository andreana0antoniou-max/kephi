import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json();
  const { entertainerId, parentName, parentEmail, parentPhone, eventDate, message } = body;

  if (!entertainerId || !parentName?.trim() || !parentEmail?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: booking, error } = await supabase
    .from("booking_requests")
    .insert({
      entertainer_id: entertainerId,
      parent_id: user.id,
      parent_name: parentName.trim(),
      parent_email: parentEmail.trim(),
      parent_phone: parentPhone?.trim() || null,
      event_date: eventDate || null,
      message: message?.trim() || null,
    })
    .select()
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: error?.message ?? "Failed to send" }, { status: 400 });
  }

  notifyEntertainer(booking.id, entertainerId, parentName.trim()).catch((err) =>
    console.error("notifyEntertainer failed:", err)
  );

  return NextResponse.json({ booking });
}

async function notifyEntertainer(bookingId: string, entertainerId: string, parentName: string) {
  const admin = createAdminClient();

  const { data: recipient } = await admin.auth.admin.getUserById(entertainerId);
  if (!recipient?.user?.email) return;

  if (recipient.user.user_metadata?.notify_bookings === false) return;

  await sendNotificationEmail({
    to: recipient.user.email,
    subject: `New booking request from ${parentName}`,
    heading: `${parentName} wants to book you`,
    body: `You've got a new booking request on Kephi. Reply soon — parents are usually checking a few entertainers at once.`,
    ctaLabel: "View request",
    ctaUrl: `https://kephi.uk/bookings/${bookingId}`,
  });
}
