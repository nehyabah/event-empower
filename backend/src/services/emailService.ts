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
  /** Six-digit code for signing in without a password. */
  async sendLoginCode({ toEmail, toName, code, expiresInMinutes }: {
    toEmail: string; toName: string; code: string; expiresInMinutes: number;
  }): Promise<void> {
    if (emailTransport === 'none') {
      console.log(`[email] no provider configured — login code for ${toEmail}: ${code}`);
      return;
    }
    const greeting = toName ? `Hi ${toName},` : 'Hello,';
    await deliver({
      to: toEmail,
      subject: `${code} is your Ajoyo sign-in code`,
      html: buildCodeHtml({
        heading: 'Sign in to Ajoyo',
        greeting,
        code,
        body: `Enter this code to sign in. It expires in ${expiresInMinutes} minutes.`,
      }),
      text: [
        greeting,
        '',
        `Your sign-in code is ${code}.`,
        `It expires in ${expiresInMinutes} minutes.`,
        '',
        "If you didn't try to sign in, you can ignore this email — nobody has access to your account.",
        '',
        '—',
        'Ajoyo — wedding planning',
      ].join('\n'),
    });
  },

  /** Six-digit code for resetting a password. */
  async sendPasswordResetCode({ toEmail, toName, code, expiresInMinutes }: {
    toEmail: string; toName: string; code: string; expiresInMinutes: number;
  }): Promise<void> {
    if (emailTransport === 'none') {
      console.log(`[email] no provider configured — reset code for ${toEmail}: ${code}`);
      return;
    }
    const greeting = toName ? `Hi ${toName},` : 'Hello,';
    await deliver({
      to: toEmail,
      subject: `${code} is your Ajoyo password reset code`,
      html: buildCodeHtml({
        heading: 'Reset your password',
        greeting,
        code,
        body: `Enter this code to choose a new password. It expires in ${expiresInMinutes} minutes.`,
      }),
      text: [
        greeting,
        '',
        `Your password reset code is ${code}.`,
        `It expires in ${expiresInMinutes} minutes.`,
        '',
        "If you didn't ask to reset your password, you can ignore this email — nothing has changed.",
        '',
        '—',
        'Ajoyo — wedding planning',
      ].join('\n'),
    });
  },

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
      subject: "You're approved — welcome to Ajoyo",
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
  const detail = [eventDate, venue].filter(Boolean).join(' · ');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;color:#2b2b2b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
  <tr><td align="center" style="padding:40px 20px 56px;">
    <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding-bottom:24px;">
        <p style="margin:0;font-size:15px;">Hi ${guestName},</p>
      </td></tr>
      <tr><td style="padding-bottom:20px;">
        <p style="margin:0;font-size:15px;">
          ${customMessage || `${coupleNames} would love to know whether you can join them.`}
        </p>
      </td></tr>
      ${detail ? `<tr><td style="padding-bottom:20px;">
        <p style="margin:0;font-size:15px;color:#6a6a6a;">${detail}</p>
      </td></tr>` : ''}
      ${deadline ? `<tr><td style="padding-bottom:20px;">
        <p style="margin:0;font-size:15px;">Could you let them know by <strong>${deadline}</strong>?</p>
      </td></tr>` : ''}
      <tr><td style="padding-bottom:24px;">
        <a href="${rsvpUrl}" style="color:#8a6a2f;text-decoration:underline;font-size:15px;">Reply to the invitation</a>
      </td></tr>
      <tr><td style="padding-bottom:4px;">
        <p style="margin:0;font-size:15px;">— ${SENDER_NAME}</p>
      </td></tr>
      <tr><td style="padding-top:32px;border-top:1px solid #ececec;">
        <p style="margin:0;font-family:${BRAND_FONT};font-size:15px;color:#8a8a8a;letter-spacing:1px;">${BRAND_HTML}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#a5a5a5;">Sent on behalf of ${coupleNames}</p>
      </td></tr>
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
/** Notice layout with a large monospaced code, for anything one-time. */
function buildCodeHtml({ heading, greeting, code, body }: {
  heading: string; greeting: string; code: string; body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;color:#2b2b2b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
  <tr><td align="center" style="padding:40px 20px 56px;">
    <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding-bottom:24px;">
        <p style="margin:0;font-size:15px;color:#2b2b2b;">${greeting}</p>
      </td></tr>
      <tr><td style="padding-bottom:20px;">
        <p style="margin:0;font-size:15px;color:#2b2b2b;">${body}</p>
      </td></tr>
      <tr><td style="padding-bottom:24px;">
        <span style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:30px;letter-spacing:8px;color:#2b2b2b;font-weight:600;">${code}</span>
      </td></tr>
      <tr><td style="padding-bottom:4px;">
        <p style="margin:0;font-size:15px;color:#2b2b2b;">— ${SENDER_NAME}</p>
      </td></tr>
      <tr><td style="padding-top:32px;border-top:1px solid #ececec;">
        <p style="margin:0;font-family:${BRAND_FONT};font-size:15px;color:#8a8a8a;letter-spacing:1px;">${BRAND_HTML}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#a5a5a5;">If you didn't ask for this, you can ignore it — nothing has changed.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/**
 * A short letter, not a notification.
 *
 * The centred card with a coloured banner and a big rounded button is the
 * house style of every templated transactional email, and it reads as one.
 * These are left-aligned, plainly set, and signed by a person — because they
 * are sent by one, and a couple planning a wedding is more likely to read
 * correspondence than a system message.
 *
 * SENDER_NAME must match the display name in EMAIL_FROM, or the signature
 * contradicts the From line.
 */
const SENDER_NAME = 'Jessie';

/**
 * The brand carries a combining grave on its final letter (U+1ECD + U+0300)
 * which many mail clients cannot compose, drawing a stray accent instead. HTML
 * lets us name fonts that handle it; plain text and headers cannot, so those
 * use "Ajoyo".
 */
const BRAND_HTML = 'àjọyọ̀';
const BRAND_FONT = "Georgia,'Times New Roman',serif";

function buildNoticeHtml({ heading, greeting, body, ctaLabel, ctaUrl }: {
  heading: string; greeting: string; body: string; ctaLabel: string; ctaUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;color:#2b2b2b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
  <tr><td align="center" style="padding:40px 20px 56px;">
    <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding-bottom:28px;">
        <p style="margin:0;font-size:15px;color:#2b2b2b;">${greeting}</p>
      </td></tr>
      <tr><td style="padding-bottom:20px;">
        <p style="margin:0;font-size:15px;color:#2b2b2b;">${body}</p>
      </td></tr>
      <tr><td style="padding-bottom:28px;">
        <a href="${ctaUrl}" style="color:#8a6a2f;text-decoration:underline;font-size:15px;">${ctaLabel}</a>
      </td></tr>
      <tr><td style="padding-bottom:4px;">
        <p style="margin:0;font-size:15px;color:#2b2b2b;">— ${SENDER_NAME}</p>
      </td></tr>
      <tr><td style="padding-top:32px;border-top:1px solid #ececec;">
        <p style="margin:0;font-family:${BRAND_FONT};font-size:15px;color:#8a8a8a;letter-spacing:1px;">${BRAND_HTML}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#a5a5a5;">Wedding planning, all in one place</p>
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
  return [greeting, '', body.replace(/\s+/g, ' ').trim(), '', ctaUrl, '', '—', 'Ajoyo — wedding planning'].join('\n');
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
    'Ajoyo — wedding planning',
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
    'Ajoyo — wedding planning',
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
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;color:#2b2b2b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
  <tr><td align="center" style="padding:40px 20px 56px;">
    <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding-bottom:24px;">
        <p style="margin:0;font-size:15px;">${greeting}</p>
      </td></tr>
      <tr><td style="padding-bottom:20px;">
        <p style="margin:0;font-size:15px;">
          <strong>${plannerName}</strong> has set up your wedding on ${BRAND_HTML} and would
          like you to join. Everything lives in one place — your guest list and replies,
          the budget, your vendors, and your wedding website.
        </p>
      </td></tr>
      <tr><td style="padding-bottom:20px;">
        <a href="${acceptUrl}" style="color:#8a6a2f;text-decoration:underline;font-size:15px;">Accept the invitation</a>
      </td></tr>
      <tr><td style="padding-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#8a8a8a;">
          Or enter this code in the app: <span style="font-family:'SF Mono',Menlo,Consolas,monospace;letter-spacing:2px;color:#2b2b2b;">${inviteCode}</span>
        </p>
      </td></tr>
      <tr><td style="padding-bottom:4px;">
        <p style="margin:0;font-size:15px;">— ${SENDER_NAME}</p>
      </td></tr>
      <tr><td style="padding-top:32px;border-top:1px solid #ececec;">
        <p style="margin:0;font-family:${BRAND_FONT};font-size:15px;color:#8a8a8a;letter-spacing:1px;">${BRAND_HTML}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#a5a5a5;">Wedding planning, all in one place</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
