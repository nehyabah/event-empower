import { env } from '../config/env.js';
import { GuestModel, Guest, GuestStatus } from '../models/Guest.js';
import { UserEventModel, UserEvent } from '../models/UserEvent.js';
import {
  GuestReminderModel,
  ReminderDate,
  GuestReminderSettings,
  FREQUENCY_DAYS,
  nextSendAt,
} from '../models/GuestReminder.js';
import { emailService } from './emailService.js';
import { twilioService } from './twilioService.js';

export interface ReminderRunResult {
  sent: number;
  skipped: number;
  failed: number;
  /** Set when nothing was attempted, explaining why. */
  reason?: string;
}

const formatDate = (value: Date | string | null): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const toDateOnly = (value: Date | string | null): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const coupleNamesFor = (event: UserEvent): string =>
  [event.partner1_name, event.partner2_name].filter(Boolean).join(' & ') || 'The couple';

/**
 * Where a reminder sends the guest: straight to the RSVP form.
 *
 * The form is the point of the email, and answering redirects them onward to
 * the couple's website — so this is the short path to both.
 */
export const buildRsvpUrl = async (event: UserEvent): Promise<string> => {
  const base = env.APP_URL.replace(/\/+$/, '');
  return `${base}/rsvp/${event.rsvp_code}`;
};

/**
 * Reasons a schedule should not fire right now. Returning a reason (rather than
 * throwing) lets the caller log it and move on to the next couple.
 */
const blockingReason = (event: UserEvent | null, settings: GuestReminderSettings): string | null => {
  if (!event) return 'No event configured';
  if (!event.rsvp_code) return 'Event has no RSVP code';

  const today = startOfToday();

  const eventDate = toDateOnly(event.event_date);
  if (eventDate && eventDate < today) return 'Event has already taken place';

  if (event.rsvp_closed) return 'RSVPs are closed';

  const deadline = toDateOnly(event.rsvp_deadline);
  if (deadline && deadline < today) return 'RSVP deadline has passed';

  // Optional quiet period in the run-up to the day itself.
  if (settings.stop_days_before > 0 && eventDate) {
    const cutoff = new Date(eventDate);
    cutoff.setDate(cutoff.getDate() - settings.stop_days_before);
    if (today >= cutoff) return `Within ${settings.stop_days_before} days of the event`;
  }

  return null;
};

/**
 * Move a schedule past the send that just happened.
 *
 * A recurring schedule jumps forward one cadence; a custom one marks the days
 * that have arrived as fulfilled, so they cannot fire twice.
 */
async function advanceSchedule(userId: string, settings: GuestReminderSettings): Promise<void> {
  if (settings.schedule_mode === 'custom_dates') {
    await GuestReminderModel.markDatesSent(userId);
    return;
  }
  await GuestReminderModel.markSent(userId, nextSendAt(settings.frequency));
}

export const reminderService = {
  async getSettings(userId: string) {
    const [settings, recentLog, dates] = await Promise.all([
      GuestReminderModel.getOrCreate(userId),
      GuestReminderModel.recentLog(userId, 20),
      GuestReminderModel.listDates(userId),
    ]);
    return { settings, recentLog, dates };
  },

  async updateSettings(userId: string, input: Parameters<typeof GuestReminderModel.update>[1]) {
    await GuestReminderModel.update(userId, input);
    // The next send depends on the settled combination of mode, start date and
    // chosen days, so it is computed once everything else has been written.
    await GuestReminderModel.resyncNextSend(userId);
    return GuestReminderModel.getOrCreate(userId);
  },

  async setDates(userId: string, dates: string[]): Promise<ReminderDate[]> {
    return GuestReminderModel.setDates(userId, dates);
  },

  /**
   * Send one round of reminders to guests who have not responded.
   *
   * Used by both the scheduler and the "send now" button; `trigger` only
   * affects how the send is recorded.
   */
  /**
   * Sends the invitation to guests who have not had one.
   *
   * Separate from sendReminders on purpose. A reminder chases people who have
   * not replied and repeats on a cadence; an invitation goes out once, to
   * everyone, and must not be sent twice — so it is keyed off
   * invitation_sent_at rather than RSVP status, and a resend picks up only the
   * guests added since.
   *
   * Email only. An invitation carries a date, a venue and a link, which is more
   * than an SMS should be asked to hold.
   */
  async sendInvitations(userId: string, options: { resendAll?: boolean } = {}): Promise<ReminderRunResult> {
    const settings = await GuestReminderModel.getOrCreate(userId);
    const event = await UserEventModel.findByUserId(userId);

    const reason = blockingReason(event, settings);
    if (reason || !event) {
      return { sent: 0, skipped: 0, failed: 0, reason: reason || 'No event configured' };
    }

    const allGuests = await GuestModel.findByUserId(userId);
    const guests = options.resendAll ? allGuests : allGuests.filter((g) => !g.invitation_sent_at);

    if (guests.length === 0) {
      return {
        sent: 0,
        skipped: 0,
        failed: 0,
        reason: allGuests.length === 0
          ? 'There is nobody on the guest list yet'
          : 'Everyone on the list has already been invited',
      };
    }

    const rsvpUrl = await buildRsvpUrl(event);
    const coupleNames = coupleNamesFor(event);
    const eventDate = formatDate(event.event_date);
    const deadline = formatDate(event.rsvp_deadline);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const guest of guests) {
      if (!guest.email) {
        skipped++;
        await GuestReminderModel.log({
          user_id: userId,
          guest_id: guest.id,
          channel: 'email',
          status: 'skipped',
          error: 'No email address on file',
          trigger: 'invitation',
        });
        continue;
      }

      try {
        await emailService.sendGuestInvitation({
          toEmail: guest.email,
          guestName: guest.name,
          coupleNames,
          eventDate,
          venue: event.venue,
          rsvpUrl,
          deadline,
          customMessage: event.rsvp_message,
        });
        // Only marked once the send resolved, so a failure is retried next time
        // rather than silently counted as delivered.
        await GuestModel.markInvited(guest.id);
        sent++;
        await GuestReminderModel.log({
          user_id: userId, guest_id: guest.id, channel: 'email',
          destination: guest.email, status: 'sent', trigger: 'invitation',
        });
      } catch (error) {
        failed++;
        await GuestReminderModel.log({
          user_id: userId, guest_id: guest.id, channel: 'email',
          destination: guest.email, status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          trigger: 'invitation',
        });
      }
    }

    return { sent, skipped, failed };
  },

  async sendReminders(userId: string, trigger: 'scheduled' | 'manual' = 'manual'): Promise<ReminderRunResult> {
    const settings = await GuestReminderModel.getOrCreate(userId);
    const event = await UserEventModel.findByUserId(userId);

    const reason = blockingReason(event, settings);
    if (reason || !event) {
      // A schedule that can never fire again is switched off rather than
      // re-checked every hour forever.
      if (trigger === 'scheduled') await GuestReminderModel.disable(userId);
      return { sent: 0, skipped: 0, failed: 0, reason: reason || 'No event configured' };
    }

    const targets: GuestStatus[] = settings.target_statuses?.length
      ? settings.target_statuses
      : ['pending', 'maybe'];

    const allGuests = await GuestModel.findByUserId(userId);
    const guests = allGuests.filter((g) => targets.includes(g.status));

    if (guests.length === 0) {
      // Still advance the schedule. Without this a couple with nobody left to
      // chase would be re-examined on every tick forever.
      await advanceSchedule(userId, settings);
      return { sent: 0, skipped: 0, failed: 0, reason: 'No guests are awaiting a response' };
    }

    const rsvpUrl = await buildRsvpUrl(event);
    const coupleNames = coupleNamesFor(event);
    const eventDate = formatDate(event.event_date);
    const deadline = formatDate(event.rsvp_deadline);

    // Don't contact anyone twice inside a single cadence window.
    const dedupeHours = Math.max(12, FREQUENCY_DAYS[settings.frequency] * 24 - 12);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const guest of guests) {
      const wantsEmail = settings.channel === 'email' || settings.channel === 'both';
      const wantsSms = settings.channel === 'sms' || settings.channel === 'both';

      const canEmail = wantsEmail && Boolean(guest.email);
      const canSms = wantsSms && Boolean(guest.phone) && twilioService.isConfigured;

      if (!canEmail && !canSms) {
        skipped++;
        await GuestReminderModel.log({
          user_id: userId,
          guest_id: guest.id,
          channel: settings.channel,
          status: 'skipped',
          error: 'No reachable contact details for the selected channel',
          trigger,
        });
        continue;
      }

      if (await GuestReminderModel.wasRecentlyNotified(guest.id, dedupeHours)) {
        skipped++;
        continue;
      }

      let delivered = false;

      if (canEmail) {
        try {
          await emailService.sendGuestRsvpReminder({
            toEmail: guest.email!,
            guestName: guest.name,
            coupleNames,
            eventDate,
            venue: event.venue,
            rsvpUrl,
            deadline,
            customMessage: settings.custom_message,
          });
          delivered = true;
          await GuestReminderModel.log({
            user_id: userId, guest_id: guest.id, channel: 'email',
            destination: guest.email, status: 'sent', trigger,
          });
        } catch (error) {
          await GuestReminderModel.log({
            user_id: userId, guest_id: guest.id, channel: 'email',
            destination: guest.email, status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error', trigger,
          });
        }
      }

      if (canSms) {
        try {
          await twilioService.sendSms(
            guest.phone!,
            buildSmsBody({ guestName: guest.name, coupleNames, eventDate, deadline, rsvpUrl })
          );
          delivered = true;
          await GuestReminderModel.log({
            user_id: userId, guest_id: guest.id, channel: 'sms',
            destination: guest.phone, status: 'sent', trigger,
          });
        } catch (error) {
          await GuestReminderModel.log({
            user_id: userId, guest_id: guest.id, channel: 'sms',
            destination: guest.phone, status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error', trigger,
          });
        }
      }

      if (delivered) sent++;
      else failed++;
    }

    await advanceSchedule(userId, settings);

    return { sent, skipped, failed };
  },

  /** One scheduler pass: run every schedule that has come due. */
  async runDueReminders(limit = 50): Promise<{ processed: number; sent: number }> {
    const due = await GuestReminderModel.findDue(limit);

    let processed = 0;
    let sent = 0;

    for (const settings of due) {
      try {
        const result = await this.sendReminders(settings.user_id, 'scheduled');
        sent += result.sent;
        processed++;
      } catch (error) {
        // One couple's failure must not stall the rest of the queue.
        console.error(`[reminders] Failed for user ${settings.user_id}:`, error);
        // Push the retry out a cycle so a persistent error doesn't hot-loop.
        await GuestReminderModel.markSent(settings.user_id, nextSendAt(settings.frequency));
      }
    }

    return { processed, sent };
  },
};

function buildSmsBody({
  guestName,
  coupleNames,
  eventDate,
  deadline,
  rsvpUrl,
}: {
  guestName: string;
  coupleNames: string;
  eventDate: string | null;
  deadline: string | null;
  rsvpUrl: string;
}): string {
  const parts = [
    `Hi ${guestName},`,
    `${coupleNames} are still hoping to hear from you${eventDate ? ` about ${eventDate}` : ''}.`,
    deadline ? `Please RSVP by ${deadline}:` : 'Please RSVP:',
    rsvpUrl,
  ];
  return parts.join(' ');
}
