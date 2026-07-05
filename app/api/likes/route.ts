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

  const { entertainerId } = await request.json();
  if (!entertainerId) {
    return NextResponse.json({ error: "Missing entertainerId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("likes")
    .insert({ parent_id: user.id, entertainer_id: entertainerId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  notifyEntertainer(entertainerId, user.id).catch((err) =>
    console.error("notifyEntertainer failed:", err)
  );

  return NextResponse.json({ ok: true });
}

async function notifyEntertainer(entertainerId: string, likerId: string) {
  const admin = createAdminClient();

  const { data: entertainer } = await admin
    .from("entertainers")
    .select("business_name")
    .eq("id", entertainerId)
    .single();
  if (!entertainer) return;

  const { data: recipient } = await admin.auth.admin.getUserById(entertainerId);
  if (!recipient?.user?.email) return;

  if (recipient.user.user_metadata?.notify_likes === false) return;

  const shouldSend = await shouldSendNotification(admin, {
    subjectId: entertainerId,
    recipientId: entertainerId,
    kind: `like:${likerId}`,
    cooldownMinutes: 30,
  });
  if (!shouldSend) return; // already emailed about this like recently

  const { data: liker } = await admin.auth.admin.getUserById(likerId);
  const likerName = (liker?.user?.user_metadata?.name as string) || "Someone";

  await sendNotificationEmail({
    to: recipient.user.email,
    subject: `${likerName} liked your Kephi profile`,
    heading: `${likerName} liked your profile`,
    body: `${entertainer.business_name}, a parent just liked your Kephi profile. Keep your listing looking sharp — it's working!`,
    ctaLabel: "View your profile",
    ctaUrl: `https://kephi.uk/dashboard`,
  });
}
