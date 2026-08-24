import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's shared "onboarding@resend.dev" sender works with no setup, but
// only delivers to the email address on the Resend account itself. Verify a
// domain in the Resend dashboard and set RESEND_FROM to send to real users.
const FROM = process.env.RESEND_FROM || "Chambers <onboarding@resend.dev>";

function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${appUrl()}/api/auth/verify?token=${encodeURIComponent(token)}`;
  // The Resend SDK does not throw on API-level failures (bad key, unverified
  // sender domain, etc.) — it resolves with { error } instead. Throw
  // ourselves so callers' try/catch (and their logging) actually fires.
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your Chambers account",
    html: `
      <div style="font-family:Georgia,serif;background:#0B0B09;color:#E8DEC8;padding:32px;">
        <h1 style="font-weight:normal;color:#F2EDE0;">Chambers</h1>
        <p>Hi ${escapeHtml(name)},</p>
        <p>Confirm this email address to finish setting up your account and connect with real brothers.</p>
        <p style="margin:28px 0;">
          <a href="${url}" style="display:inline-block;padding:12px 20px;background:#C8A86B;color:#0B0B09;text-decoration:none;font-family:sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Verify Email</a>
        </p>
        <p style="font-size:12px;color:#9A9080;">Or paste this link into your browser: ${url}</p>
        <p style="font-size:12px;color:#9A9080;">This link expires in 24 hours. If you didn't create a Chambers account, you can ignore this email.</p>
      </div>
    `,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return data;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
