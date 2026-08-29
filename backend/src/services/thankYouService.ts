import { env } from '../config/env.js';
import { GuestModel, Guest } from '../models/Guest.js';
import { UserEventModel, UserEvent } from '../models/UserEvent.js';
import { CoupleStoryModel } from '../models/CoupleStory.js';
import {
  ThankYouNoteModel,
  ThankYouNote,
  ThankYouAudience,
} from '../models/ThankYouNote.js';
import { emailService } from './emailService.js';

/**
 * The note a couple sends their guests once the wedding is behind them.
 *
 * Deliberately a single deliberate send rather than a drip: this is the last
 * thing the couple says to everyone who came, and the failure mode worth
 * designing against is sending it twice or sending it half-written, not
 * sending it slowly.
 */

const coupleNamesFor = (event: UserEvent | null): string =>
  [event?.partner1_name, event?.partner2_name].filter(Boolean).join(' & ') || 'The couple';

function badRequest(message: string): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = 400;
  return err;
}

export interface AudienceBreakdown {
  /** Guests who will receive it. */
  reachable: number;
  /** In the audience but with no email address on file. */
  noEmail: number;
  /** Already thanked under this note, so a resend would skip them. */
  alreadySent: number;
}

/**
 * Who a given audience actually resolves to.
 *
 * 'attended' is the default and means guests who confirmed. A couple thinking
 * "everyone who came" will otherwise mail people who declined, which reads
 * badly enough to be worth making the narrower option the one you get without
 * choosing.
 */
export function selectAudience(guests: Guest[], audience: ThankYouAudience): Guest[] {
  return audience === 'all' ? guests : guests.filter((g) => g.status === 'confirmed');
}

export const thankYouService = {
  async getDraft(userId: string): Promise<ThankYouNote | null> {
    return ThankYouNoteModel.findDraft(userId);
  },

  /** Only so the composer can soften its copy before the day has happened. */
  async eventDate(userId: string): Promise<string | null> {
    const event = await UserEventModel.findByUserId(userId);
    return event?.event_date ? new Date(event.event_date).toISOString() : null;
  },

  async saveDraft(
    userId: string,
    input: { subject: string; body: string; photo_url?: string | null; audience?: ThankYouAudience }
  ): Promise<ThankYouNote> {
    return ThankYouNoteModel.saveDraft(userId, input);
  },

  /** Counts behind the "this will go to N people" line in the composer. */
  async breakdown(userId: string, audience: ThankYouAudience): Promise<AudienceBreakdown> {
    const guests = await GuestModel.findByUserId(userId);
    const selected = selectAudience(guests, audience);

    const draft = await ThankYouNoteModel.findDraft(userId);
    const sentAlready = draft ? await ThankYouNoteModel.alreadySent(draft.id) : new Set<string>();

    let reachable = 0;
    let noEmail = 0;
    let alreadySent = 0;

    for (const guest of selected) {
      if (!guest.email) noEmail++;
      else if (sentAlready.has(guest.id)) alreadySent++;
      else reachable++;
    }

    return { reachable, noEmail, alreadySent };
  },

  /**
   * Sends the draft, one guest at a time.
   *
   * A failed address is logged and the batch carries on: the alternative is
   * one bad row stopping two hundred people from being thanked. Retrying is
   * safe — anyone already marked sent is skipped, so a second attempt only
   * picks up what did not get through.
   */
  async send(userId: string): Promise<{ sent: number; failed: number; skipped: number }> {
    const note = await ThankYouNoteModel.findDraft(userId);
    if (!note) throw badRequest('There is no thank-you note to send yet.');
    if (!note.subject.trim() || !note.body.trim()) {
      throw badRequest('Add a subject and a message before sending.');
    }

    const [event, guests, story] = await Promise.all([
      UserEventModel.findByUserId(userId),
      GuestModel.findByUserId(userId),
      CoupleStoryModel.findByUserId(userId),
    ]);

    const coupleNames = coupleNamesFor(event);
    // Only link the site if it is actually reachable — a link to a page that
    // asks the guest to sign in is worse than no link.
    const siteUrl =
      story?.site_published && story.slug
        ? `${env.APP_URL.replace(/\/+$/, '')}/s/${story.slug}`
        : null;

    const selected = selectAudience(guests, note.audience);
    const sentAlready = await ThankYouNoteModel.alreadySent(note.id);

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const guest of selected) {
      if (!guest.email) {
        skipped++;
        await ThankYouNoteModel.logRecipient({
          note_id: note.id,
          guest_id: guest.id,
          guest_name: guest.name,
          email: null,
          status: 'skipped',
          error: 'No email address on file',
        });
        continue;
      }

      if (sentAlready.has(guest.id)) {
        skipped++;
        continue;
      }

      try {
        await emailService.sendThankYou({
          toEmail: guest.email,
          guestName: guest.name,
          coupleNames,
          subject: note.subject,
          body: note.body,
          photoUrl: note.photo_url,
          siteUrl,
        });
        sent++;
        await ThankYouNoteModel.logRecipient({
          note_id: note.id,
          guest_id: guest.id,
          guest_name: guest.name,
          email: guest.email,
          status: 'sent',
        });
      } catch (error) {
        failed++;
        await ThankYouNoteModel.logRecipient({
          note_id: note.id,
          guest_id: guest.id,
          guest_name: guest.name,
          email: guest.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Closed once anything got through. Leaving it a draft after a partial
    // send would let a later edit go out to the half who already read it.
    if (sent > 0) await ThankYouNoteModel.markSent(note.id);

    return { sent, failed, skipped };
  },

  async history(userId: string) {
    const notes = await ThankYouNoteModel.listSent(userId);
    return Promise.all(
      notes.map(async (note) => ({
        ...note,
        recipients: await ThankYouNoteModel.listRecipients(note.id),
      }))
    );
  },
};
