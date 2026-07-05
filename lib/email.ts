import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Kephi <notifications@kephi.uk>";

export async function sendNotificationEmail({
  to,
  subject,
  heading,
  body,
  ctaLabel,
  ctaUrl,
}: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #F7F1E7;">
          <p style="font-weight: 700; font-size: 20px; color: #262130; margin: 0 0 24px;">kephi</p>
          <h1 style="font-size: 20px; color: #262130; margin: 0 0 12px;">${heading}</h1>
          <p style="color: #262130; opacity: 0.8; line-height: 1.5; margin: 0 0 24px;">${body}</p>
          <a href="${ctaUrl}" style="display: inline-block; background: #F26B3A; color: white; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-weight: 700; font-size: 14px;">${ctaLabel}</a>
        </div>
      `,
    });
  } catch (err) {
    // Never let a failed email break the actual action (message sent,
    // like recorded, etc.) — just log it.
    console.error("Failed to send notification email:", err);
  }
}
