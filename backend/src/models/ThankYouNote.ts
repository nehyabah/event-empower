import { query, queryOne } from '../config/database.js';

export type ThankYouAudience = 'attended' | 'all';
export type ThankYouRecipientStatus = 'sent' | 'failed' | 'skipped';

export interface ThankYouNote {
  id: string;
  user_id: string;
  subject: string;
  body: string;
  photo_url: string | null;
  audience: ThankYouAudience;
  /** Null while it is still a draft. */
  sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UpsertThankYouNoteInput {
  subject: string;
  body: string;
  photo_url?: string | null;
  audience?: ThankYouAudience;
}

export interface ThankYouRecipient {
  id: string;
  note_id: string;
  guest_id: string | null;
  guest_name: string | null;
  email: string | null;
  status: ThankYouRecipientStatus;
  error: string | null;
  created_at: Date;
}

export const ThankYouNoteModel = {
  async findById(id: string): Promise<ThankYouNote | null> {
    return queryOne<ThankYouNote>('SELECT * FROM thank_you_notes WHERE id = $1', [id]);
  },

  /**
   * The couple's working note.
   *
   * One draft at a time — a couple writes a single thank-you, and offering a
   * list of them would invite the question of which one is "the" note.
   * Already-sent notes stay as history and are read through listSent.
   */
  async findDraft(userId: string): Promise<ThankYouNote | null> {
    return queryOne<ThankYouNote>(
      `SELECT * FROM thank_you_notes
        WHERE user_id = $1 AND sent_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId]
    );
  },

  async listSent(userId: string): Promise<ThankYouNote[]> {
    return query<ThankYouNote>(
      `SELECT * FROM thank_you_notes
        WHERE user_id = $1 AND sent_at IS NOT NULL
        ORDER BY sent_at DESC`,
      [userId]
    );
  },

  /** Creates the draft on first save and updates it on every save after. */
  async saveDraft(userId: string, input: UpsertThankYouNoteInput): Promise<ThankYouNote> {
    const existing = await this.findDraft(userId);

    if (existing) {
      const updated = await queryOne<ThankYouNote>(
        `UPDATE thank_you_notes
            SET subject = $2, body = $3, photo_url = $4, audience = $5, updated_at = NOW()
          WHERE id = $1
        RETURNING *`,
        [existing.id, input.subject, input.body, input.photo_url ?? null, input.audience ?? existing.audience]
      );
      return updated!;
    }

    const created = await queryOne<ThankYouNote>(
      `INSERT INTO thank_you_notes (user_id, subject, body, photo_url, audience)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, input.subject, input.body, input.photo_url ?? null, input.audience ?? 'attended']
    );
    return created!;
  },

  async markSent(id: string): Promise<void> {
    await query('UPDATE thank_you_notes SET sent_at = NOW(), updated_at = NOW() WHERE id = $1', [id]);
  },

  /**
   * Records one guest's outcome.
   *
   * The partial unique index means a guest already marked sent cannot be
   * written twice, so a retry after a partial failure re-sends only to the
   * addresses that did not get through.
   *
   * Untargeted ON CONFLICT on purpose: naming the columns would require the
   * inference predicate to match the index's own WHERE clause exactly, and
   * getting that subtly wrong fails at runtime in the middle of a send rather
   * than at build time. Nothing else on this table can conflict.
   */
  async logRecipient(entry: {
    note_id: string;
    guest_id: string | null;
    guest_name: string | null;
    email: string | null;
    status: ThankYouRecipientStatus;
    error?: string | null;
  }): Promise<void> {
    await query(
      `INSERT INTO thank_you_note_recipients
         (note_id, guest_id, guest_name, email, status, error)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [entry.note_id, entry.guest_id, entry.guest_name, entry.email, entry.status, entry.error ?? null]
    );
  },

  /** Guests already thanked under this note, so a retry can skip them. */
  async alreadySent(noteId: string): Promise<Set<string>> {
    const rows = await query<{ guest_id: string }>(
      `SELECT guest_id FROM thank_you_note_recipients
        WHERE note_id = $1 AND status = 'sent' AND guest_id IS NOT NULL`,
      [noteId]
    );
    return new Set(rows.map((r) => r.guest_id));
  },

  async listRecipients(noteId: string): Promise<ThankYouRecipient[]> {
    return query<ThankYouRecipient>(
      `SELECT * FROM thank_you_note_recipients
        WHERE note_id = $1
        ORDER BY created_at DESC`,
      [noteId]
    );
  },
};
