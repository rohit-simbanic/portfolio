import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// ─── CONFIG — change these ─────────────────────────────────────────────────
const YOUR_NAME = "Rohit";
const YOUR_EMAIL = "rohit.simbanic2023@gmail.com"; // where YOU receive leads
const FROM_DOMAIN = "onboarding@resend.dev"; // use this until you verify a domain
//   Once you verify your domain on resend.com, change FROM_DOMAIN to:
//   "contact@yourdomain.com"
// ──────────────────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY_FORM);

const SUBJECT_LABELS: Record<string, string> = {
  freelance: "Freelance Project",
  fulltime: "Full-time Opportunity",
  collab: "Open Source Collab",
  other: "Just Saying Hi",
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    // Basic validation
    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }
    if (!/\S+@\S+\.\S+/.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    const subjectLabel =
      SUBJECT_LABELS[body.subject] ?? body.subject ?? "General";
    const now = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    // ── 1. Notification email → YOU ────────────────────────────────────────
    await resend.emails.send({
      from: FROM_DOMAIN,
      to: YOUR_EMAIL,
      replyTo: body.email, // hitting Reply goes to sender
      subject: `🔔 New lead: ${subjectLabel} from ${body.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width" />
        </head>
        <body style="margin:0;padding:0;background:#FAF6ED;font-family:'DM Sans',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6ED;padding:40px 16px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #F3EAD5;">

                <!-- Header -->
                <tr>
                  <td style="background:#1A1208;padding:28px 36px;">
                    <p style="margin:0;font-size:11px;color:#8A7355;letter-spacing:3px;text-transform:uppercase;font-family:monospace;">Portfolio Contact</p>
                    <h1 style="margin:8px 0 0;font-size:22px;color:#ffffff;font-weight:700;">
                      New message from ${body.name}
                    </h1>
                  </td>
                </tr>

                <!-- Meta pills -->
                <tr>
                  <td style="padding:24px 36px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#FEF3DC;border:1px solid #F4A02440;border-radius:99px;padding:4px 14px;font-size:12px;font-weight:600;color:#C47208;font-family:monospace;">
                          ${subjectLabel}
                        </td>
                        <td width="10"></td>
                        <td style="background:#F3EAD5;border-radius:99px;padding:4px 14px;font-size:12px;color:#5C4A2A;font-family:monospace;">
                          ${now}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Fields -->
                <tr>
                  <td style="padding:24px 36px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F3EAD5;border-radius:12px;overflow:hidden;">
                      ${[
                        ["Name", body.name],
                        ["Email", body.email],
                        ["Subject", subjectLabel],
                      ]
                        .map(
                          ([label, value], i) => `
                        <tr style="background:${i % 2 === 0 ? "#ffffff" : "#FAF6ED"};">
                          <td style="padding:12px 18px;font-size:11px;font-family:monospace;color:#8A7355;text-transform:uppercase;letter-spacing:1px;width:80px;white-space:nowrap;">${label}</td>
                          <td style="padding:12px 18px;font-size:14px;color:#1A1208;font-weight:500;">${value}</td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </table>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td style="padding:0 36px 28px;">
                    <p style="margin:0 0 10px;font-size:11px;font-family:monospace;color:#8A7355;text-transform:uppercase;letter-spacing:1px;">Message</p>
                    <div style="background:#FAF6ED;border-left:3px solid #F4A024;border-radius:0 12px 12px 0;padding:16px 20px;font-size:14px;color:#2E2112;line-height:1.7;white-space:pre-wrap;">${body.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding:0 36px 32px;">
                    <a href="mailto:${body.email}?subject=Re: ${encodeURIComponent(subjectLabel)}"
                       style="display:inline-block;background:#F4A024;color:#1A1208;font-weight:700;font-size:14px;padding:12px 28px;border-radius:99px;text-decoration:none;">
                      Reply to ${body.name} →
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#F3EAD5;padding:16px 36px;">
                    <p style="margin:0;font-size:11px;font-family:monospace;color:#8A7355;">
                      Sent from your portfolio contact form · rohit.simbanic2023@gmail.com
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    // ── 2. Auto-reply → SENDER ─────────────────────────────────────────────
    await resend.emails.send({
      from: FROM_DOMAIN,
      to: body.email,
      subject: `Got your message, ${body.name.split(" ")[0]}! I'll be in touch soon 👋`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
        <body style="margin:0;padding:0;background:#FAF6ED;font-family:'DM Sans',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6ED;padding:40px 16px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #F3EAD5;">

                <tr>
                  <td style="background:#1A1208;padding:28px 36px;">
                    <p style="margin:0;font-size:11px;color:#8A7355;letter-spacing:3px;text-transform:uppercase;font-family:monospace;">Auto-reply</p>
                    <h1 style="margin:8px 0 0;font-size:22px;color:#ffffff;font-weight:700;">
                      Thanks for reaching out! 🙌
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 36px;">
                    <p style="margin:0 0 16px;font-size:15px;color:#1A1208;line-height:1.7;">
                      Hey <strong>${body.name.split(" ")[0]}</strong>,
                    </p>
                    <p style="margin:0 0 16px;font-size:15px;color:#5C4A2A;line-height:1.7;">
                      I've received your message about <strong>${subjectLabel}</strong> and will get back to you within <strong>24 hours</strong>.
                    </p>
                    <p style="margin:0 0 24px;font-size:15px;color:#5C4A2A;line-height:1.7;">
                      In the meantime, feel free to check out my work on GitHub or connect on LinkedIn.
                    </p>

                    <!-- Summary box -->
                    <div style="background:#FAF6ED;border:1px solid #F3EAD5;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                      <p style="margin:0 0 12px;font-size:11px;font-family:monospace;color:#8A7355;text-transform:uppercase;letter-spacing:1px;">Your message summary</p>
                      <p style="margin:0 0 6px;font-size:13px;color:#1A1208;"><strong>Topic:</strong> ${subjectLabel}</p>
                      <p style="margin:0;font-size:13px;color:#5C4A2A;line-height:1.6;white-space:pre-wrap;">${body.message.length > 200 ? body.message.slice(0, 200).replace(/</g, "&lt;") + "…" : body.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                    </div>

                    <!-- Links -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;">
                          <a href="https://github.com/rohit-simbanic" style="display:inline-block;background:#1A1208;color:#ffffff;font-weight:600;font-size:13px;padding:10px 22px;border-radius:99px;text-decoration:none;">GitHub ↗</a>
                        </td>
                        <td>
                          <a href="https://www.linkedin.com/in/rohit-m-552776aa/" style="display:inline-block;background:#F4A024;color:#1A1208;font-weight:600;font-size:13px;padding:10px 22px;border-radius:99px;text-decoration:none;">LinkedIn ↗</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="background:#F3EAD5;padding:16px 36px;">
                    <p style="margin:0;font-size:12px;color:#8A7355;line-height:1.6;">
                      ${YOUR_NAME} · Full-Stack Developer<br/>
                      <a href="mailto:${YOUR_EMAIL}" style="color:#C47208;text-decoration:none;">${YOUR_EMAIL}</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[contact/route] error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to send message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
