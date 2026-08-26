import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * SMTP takes precedence over Resend when configured, so moving to a
 * pay-as-you-go provider (Amazon SES, Brevo, Mailgun...) is a config change
 * rather than a code change. With neither set, sends are logged instead —
 * useful in development, and it keeps a missing key from breaking a signup.
 */
const smtp = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      // 465 is implicit TLS; 587 starts plaintext and upgrades via STARTTLS.
      secure: Number(env.SMTP_PORT) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    })
  : null;

const brevoApiKey = env.BREVO_API_KEY || null;

export const emailTransport = brevoApiKey
  ? 'brevo'
  : smtp
  ? 'smtp'
  : resend
  ? 'resend'
  : 'none';

/** Split "Name <a@b.com>" into the shape Brevo's API expects. */
function parseSender(value: string): { name?: string; email: string } {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return match ? { name: match[1] || undefined, email: match[2] } : { email: value.trim() };
}

/** Deliver through whichever provider is configured. */
async function deliver(message: {
  to: string;
  subject: string;
  html: string;
  /** Mail with no text/plain alternative is a long-standing spam signal. */
  text: string;
  replyTo?: string;
}): Promise<void> {
  if (brevoApiKey) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: parseSender(env.EMAIL_FROM),
        to: [{ email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
        ...(message.replyTo ? { replyTo: { email: message.replyTo } } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[email] Brevo error:', response.status, detail.slice(0, 300));
      throw new Error('Failed to send email');
    }
    return;
  }

  if (smtp) {
    await smtp.sendMail({ from: env.EMAIL_FROM, ...message });
    return;
  }

  const { error } = await resend!.emails.send({
    from: env.EMAIL_FROM,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    ...(message.replyTo ? { replyTo: message.replyTo } : {}),
  });
  if (error) {
    console.error('[email] Resend error:', error);
    throw new Error('Failed to send email');
  }
}

export const emailService = {
  /** Confirms a professional's profile reached the review queue. */
  async sendOnboardingSubmitted({ toEmail, toName }: { toEmail: string; toName: string }): Promise<void> {
    if (emailTransport === 'none') {
      console.log(`[email] no provider configured — onboarding submitted for ${toEmail}`);
      return;
    }
    await deliver({
      to: toEmail,
      subject: 'We have your details — application under review',
      html: buildNoticeHtml({
        heading: 'Application received',
        greeting: toName ? `Hi ${toName},` : 'Hello,',
        body: `Thanks for setting up your profile. Our team reviews every vendor and planner
               before they go live, usually within 1 working day. We'll email you the moment
               you're approved — there's nothing else you need to do.`,
        ctaLabel: 'View your profile',
        ctaUrl: `${env.APP_URL}/home`,
      }),
      text: buildNoticeText({
        greeting: toName ? `Hi ${toName},` : 'Hello,',
        body: "Thanks for setting up your profile. Our team reviews every vendor and planner before they go live, usually within 1 working day. We'll email you the moment you're approved.",
        ctaUrl: `${env.APP_URL}/home`,
      }),
    });
  },

  /** Tells a professional their account is live. */
  async sendAccountApproved({ toEmail, toName }: { toEmail: string; toName: string }): Promise<void> {
    if (emailTransport === 'none') {
      console.log(`[email] no provider configured — approval for ${toEmail}`);
      return;
    }
    await deliver({
      to: toEmail,
      subject: "You're approved — welcome to àjọyọ̀",
      html: buildNoticeHtml({
        heading: "You're approved",
        greeting: toName ? `Hi ${toName},` : 'Hello,',
        body: `Your account has been reviewed and approved. You now have full access —
               couples can find you, and you can start taking bookings.`,
        ctaLabel: 'Go to your dashboard',
        ctaUrl: `${env.APP_URL}/home`,
      }),
      text: buildNoticeText({
        greeting: toName ? `Hi ${toName},` : 'Hello,',
        body: 'Your account has been reviewed and approved. You now have full access — couples can find you, and you can start taking bookings.',
        ctaUrl: `${env.APP_URL}/home`,
      }),
    });
  },

  async sendPlannerInvite({
    toEmail,
    toName,
    plannerName,
    inviteCode,
    replyTo,
  }: {
    toEmail: string;
    toName: string;
    plannerName: string;
    inviteCode: string;
    /** The planner's own address, so a couple hitting reply reaches a human. */
    replyTo?: string;
  }): Promise<void> {
    const acceptUrl = `${env.APP_URL}/accept-invite?code=${inviteCode}`;

    if (emailTransport === 'none') {
      console.log(`[email] no provider configured — invite link for ${toEmail}: ${acceptUrl}`);
      return;
    }

    await deliver({
      to: toEmail,
      subject: `${plannerName} is ready to plan your wedding`,
      html: buildInviteHtml({ toName, plannerName, acceptUrl, inviteCode }),
      text: buildInviteText({ toName, plannerName, acceptUrl, inviteCode }),
      ...(replyTo ? { replyTo } : {}),
    });
  },

  /** RSVP nudge for a guest who has not responded yet. */
  async sendGuestRsvpReminder({
    toEmail,
    guestName,
    coupleNames,
    eventDate,
    venue,
    rsvpUrl,
    deadline,
    customMessage,
    replyTo,
  }: {
    toEmail: string;
    guestName: string;
    coupleNames: string;
    eventDate: string | null;
    venue: string | null;
    rsvpUrl: string;
    deadline: string | null;
    customMessage?: string | null;
    replyTo?: string;
  }): Promise<void> {
    if (emailTransport === 'none') {
      console.log(`[email] no provider configured — RSVP reminder for ${toEmail}: ${rsvpUrl}`);
      return;
    }

    await deliver({
      to: toEmail,
      subject: deadline
        ? `Reminder: RSVP for ${coupleNames} by ${deadline}`
        : `Reminder: RSVP for ${coupleNames}`,
      html: buildRsvpReminderHtml({
        guestName,
        coupleNames,
        eventDate,
        venue,
        rsvpUrl,
        deadline,
        customMessage,
      }),
      text: buildRsvpReminderText({
        guestName,
        coupleNames,
        eventDate,
        venue,
        rsvpUrl,
        deadline,
        customMessage,
      }),
      ...(replyTo ? { replyTo } : {}),
    });
  },
};

function buildRsvpReminderHtml({
  guestName,
  coupleNames,
  eventDate,
  venue,
  rsvpUrl,
  deadline,
  customMessage,
}: {
  guestName: string;
  coupleNames: string;
  eventDate: string | null;
  venue: string | null;
  rsvpUrl: string;
  deadline: string | null;
  customMessage?: string | null;
}): string {
  const greeting = guestName ? `Hi ${escapeHtml(guestName)},` : 'Hello,';

  const detailRow = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:#9ca3af;width:90px;">${label}</td>
      <td style="padding:6px 0;font-size:14px;color:#2e3240;font-weight:500;">${value}</td>
    </tr>`;

  const details = [
    eventDate ? detailRow('Date', escapeHtml(eventDate)) : '',
    venue ? detailRow('Venue', escapeHtml(venue)) : '',
    deadline ? detailRow('RSVP by', escapeHtml(deadline)) : '',
  ].join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#faf9f7;font-family:'Montserrat',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf9f7;padding:48px 16px 64px;">
  <tr><td align="center">
    <table role="presentation" width="100%" style="max-width:540px;" cellpadding="0" cellspacing="0">

      <tr>
        <td align="center" style="padding-bottom:32px;">
          <p style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2e3240;letter-spacing:3px;">àjọyọ̀</p>
        </td>
      </tr>

      <tr>
        <td style="background:#ffffff;border-radius:12px;border:1px solid #ece8e2;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:4px;background:#b2834c;"></td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:44px 48px 36px;text-align:center;">
                <p style="margin:0 0 22px;font-size:34px;line-height:1;">💌</p>

                <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:30px;font-weight:500;color:#2e3240;line-height:1.3;">
                  We're still hoping<br>to hear from you
                </h1>

                <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7;">
                  ${greeting}<br>
                  ${escapeHtml(coupleNames)} would love to know whether you can join them.
                </p>

                ${customMessage ? `<p style="margin:0 0 28px;padding:14px 18px;background:#faf9f7;border-left:3px solid #b2834c;border-radius:4px;font-size:14px;color:#4b5563;line-height:1.7;text-align:left;">${escapeHtml(customMessage)}</p>` : ''}

                ${details ? `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;text-align:left;">${details}</table>` : ''}

                <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                  <tr>
                    <td style="background-color:#b2834c;border-radius:8px;">
                      <a href="${rsvpUrl}" target="_blank"
                        style="display:inline-block;padding:15px 36px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:.5px;text-transform:uppercase;">
                        RSVP now
                      </a>
                    </td>
                  </tr>
                </table>

                ${deadline ? `<p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">Please respond by <strong style="color:#b2834c;">${escapeHtml(deadline)}</strong> — the link closes after that.</p>` : ''}
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:0 48px;"><div style="height:1px;background:#f0ede8;"></div></td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:24px 48px 32px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#c0bdb8;line-height:1.7;">
                  You're receiving this because ${escapeHtml(coupleNames)} added you to their guest list.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Plain-text mirror of the invite; every HTML mail should carry one. */
/** Shared shell for short transactional notices, matching the invite styling. */
function buildNoticeHtml({ heading, greeting, body, ctaLabel, ctaUrl }: {
  heading: string; greeting: string; body: string; ctaLabel: string; ctaUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#faf9f7;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf9f7;padding:48px 16px 64px;">
  <tr><td align="center">
    <table role="presentation" width="100%" style="max-width:540px;" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding-bottom:32px;">
        <p style="margin:0;font-family:Georgia,serif;font-size:26px;color:#2e3240;letter-spacing:3px;">àjọyọ̀</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:12px;border:1px solid #ece8e2;overflow:hidden;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="height:4px;background:#b2834c;"></td></tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:44px 48px 40px;">
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;font-weight:500;color:#2e3240;">${heading}</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a4a4a;">${greeting}</p>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4a4a4a;">${body}</p>
            <a href="${ctaUrl}" style="display:inline-block;background:#2e3240;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:6px;font-size:14px;">${ctaLabel}</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="padding-top:28px;">
        <p style="margin:0;font-size:12px;color:#9b9b9b;">àjọyọ̀ — wedding planning</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** Plain-text mirror of buildNoticeHtml. */
function buildNoticeText({ greeting, body, ctaUrl }: {
  greeting: string; body: string; ctaUrl: string;
}): string {
  return [greeting, '', body.replace(/\s+/g, ' ').trim(), '', ctaUrl, '', '—', 'ajoyo — wedding planning'].join('\n');
}

function buildInviteText({ toName, plannerName, acceptUrl, inviteCode }: {
  toName: string; plannerName: string; acceptUrl: string; inviteCode: string;
}): string {
  return [
    toName ? `Hi ${toName},` : 'Hello,',
    '',
    `${plannerName} has invited you to plan your wedding on ajoyo.`,
    '',
    'Accept your invitation:',
    acceptUrl,
    '',
    `Or enter this code in the app: ${inviteCode}`,
    '',
    '—',
    'ajoyo — wedding planning',
  ].join('\n');
}

/** Plain-text mirror of the RSVP reminder. */
function buildRsvpReminderText({ guestName, coupleNames, eventDate, venue, rsvpUrl, deadline, customMessage }: {
  guestName: string; coupleNames: string; eventDate: string | null; venue: string | null;
  rsvpUrl: string; deadline: string | null; customMessage?: string | null;
}): string {
  return [
    `Hi ${guestName},`,
    '',
    customMessage || `${coupleNames} would love to know if you can join them.`,
    '',
    eventDate ? `Date: ${eventDate}` : null,
    venue ? `Venue: ${venue}` : null,
    deadline ? `Please respond by ${deadline}.` : null,
    '',
    'RSVP here:',
    rsvpUrl,
    '',
    '—',
    'ajoyo — wedding planning',
  ].filter((line) => line !== null).join('\n');
}

function buildInviteHtml({
  toName,
  plannerName,
  acceptUrl,
  inviteCode,
}: {
  toName: string;
  plannerName: string;
  acceptUrl: string;
  inviteCode: string;
}): string {
  const greeting = toName ? `Hi ${toName},` : 'Hello,';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#faf9f7;font-family:'Montserrat',Helvetica,Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf9f7;padding:48px 16px 64px;">
  <tr><td align="center">
    <table role="presentation" width="100%" style="max-width:540px;" cellpadding="0" cellspacing="0">

      <!-- Wordmark -->
      <tr>
        <td align="center" style="padding-bottom:32px;">
          <p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:400;color:#2e3240;letter-spacing:3px;">àjọyọ̀</p>
        </td>
      </tr>

      <!-- Card -->
      <tr>
        <td style="background:#ffffff;border-radius:12px;border:1px solid #ece8e2;overflow:hidden;">

          <!-- Top accent bar -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="height:4px;background:#b2834c;"></td>
            </tr>
          </table>

          <!-- Card body -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:48px 48px 40px;text-align:center;">

                <!-- Decorative rings -->
                <p style="margin:0 0 24px;font-size:36px;line-height:1;">💍</p>

                <!-- Heading -->
                <h1 style="margin:0 0 12px;font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:500;color:#2e3240;line-height:1.25;letter-spacing:-.3px;">
                  You're invited to plan<br>your perfect wedding
                </h1>

                <!-- Subtext -->
                <p style="margin:0 0 32px;font-size:15px;color:#6b7280;line-height:1.7;">
                  ${greeting}<br>
                  <span style="color:#2e3240;"><strong>${plannerName}</strong></span> has added you as a client on àjọyọ̀.
                  Accept the invitation below to access your shared wedding workspace.
                </p>

                <!-- CTA button -->
                <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                  <tr>
                    <td style="background-color:#b2834c;border-radius:8px;">
                      <a href="${acceptUrl}" target="_blank"
                        style="display:inline-block;padding:15px 36px;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:.5px;text-transform:uppercase;">
                        Accept Invitation
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Manual code -->
                <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
                  Or enter code manually:
                  <span style="display:inline-block;margin-top:6px;padding:6px 14px;background:#faf9f7;border:1px solid #ece8e2;border-radius:6px;font-family:'Montserrat',monospace;font-size:14px;font-weight:600;color:#b2834c;letter-spacing:2px;">${inviteCode}</span>
                </p>

              </td>
            </tr>
          </table>

          <!-- Divider -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:0 48px;"><div style="height:1px;background:#f0ede8;"></div></td></tr>
          </table>

          <!-- Features row -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:32px 48px 40px;">
                <p style="margin:0 0 20px;font-size:11px;font-weight:600;color:#b2834c;text-transform:uppercase;letter-spacing:1.5px;text-align:center;">Everything in one place</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:33.3%;text-align:center;vertical-align:top;padding:0 8px;">
                      <p style="margin:0 0 8px;font-size:22px;">📋</p>
                      <p style="margin:0;font-size:13px;font-weight:600;color:#2e3240;">Shared checklists</p>
                      <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">Stay in sync on every task</p>
                    </td>
                    <td style="width:33.3%;text-align:center;vertical-align:top;padding:0 8px;">
                      <p style="margin:0 0 8px;font-size:22px;">💰</p>
                      <p style="margin:0;font-size:13px;font-weight:600;color:#2e3240;">Budget tracking</p>
                      <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">Every naira accounted for</p>
                    </td>
                    <td style="width:33.3%;text-align:center;vertical-align:top;padding:0 8px;">
                      <p style="margin:0 0 8px;font-size:22px;">🤝</p>
                      <p style="margin:0;font-size:13px;font-weight:600;color:#2e3240;">Vendor roster</p>
                      <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">All your vendors in one view</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Footer inside card -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:0 48px;"><div style="height:1px;background:#f0ede8;"></div></td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:24px 48px 32px;text-align:center;">
                <p style="margin:0 0 6px;font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;font-weight:400;color:#b2834c;letter-spacing:2px;">àjọyọ̀</p>
                <p style="margin:0;font-size:12px;color:#c0bdb8;line-height:1.7;">
                  This invite was sent by your wedding planner, ${plannerName}.<br>
                  If you weren't expecting this, you can safely ignore it.
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>

    </table>
  </td></tr>
</table>

</body>
</html>`;
}
