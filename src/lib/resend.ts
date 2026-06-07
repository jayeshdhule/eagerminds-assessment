import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function sendWelcomeEmail(opts: {
  to: string;
  handle: string;
  appUrl: string;
}) {
  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY missing — skipping welcome email");
    return { skipped: true };
  }
  const resend = new Resend(apiKey);
  const profileUrl = `${opts.appUrl}/${opts.handle}`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#0f1115">
      <div style="font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#c44b2c;margin-bottom:8px">EagerMinds</div>
      <h1 style="font-size:28px;margin:0 0 16px 0;font-weight:600">Welcome, @${opts.handle}.</h1>
      <p style="font-size:16px;line-height:1.55;margin:0 0 16px 0">
        Your bookmarks home is ready. Save links, mark some public, share your profile.
      </p>
      <p style="font-size:16px;line-height:1.55;margin:0 0 24px 0">
        Your public page lives at <a href="${profileUrl}" style="color:#c44b2c">${profileUrl}</a>.
      </p>
      <a href="${opts.appUrl}/dashboard"
         style="display:inline-block;background:#0f1115;color:#f5f1e8;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:500">
        Open dashboard →
      </a>
      <p style="font-size:12px;color:#6b6b6b;margin-top:32px">
        You're receiving this because you signed up at EagerMinds Bookmarks.
      </p>
    </div>`;

  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: `Welcome to EagerMinds, @${opts.handle}`,
    html,
  });
  if (error) {
    console.error("[resend] send error", error);
    return { skipped: false, error: error.message };
  }
  return { skipped: false };
}
