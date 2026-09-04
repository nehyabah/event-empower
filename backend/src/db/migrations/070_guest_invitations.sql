-- Sending the invitation itself, not just chasing the reply.
--
-- Until now the only mail a guest could receive was the RSVP *reminder*, which
-- runs on a cadence. There was no way to send the invitation, so couples added
-- a guest list, copied the share link — the toast said "Invitation link copied"
-- — and reasonably assumed the invitation had gone out. Nothing had: as of
-- 4 Sep 2026 guest_reminder_log had never held a single row.

-- Which guests have actually been invited, so a second send does not write to
-- the same people twice and the couple can see who is outstanding.
ALTER TABLE guests ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_guests_invitation_sent
  ON guests(user_id) WHERE invitation_sent_at IS NULL;

-- The log is shared with reminders; 'invitation' distinguishes the two so the
-- couple's history reads correctly and either can be counted on its own.
ALTER TABLE guest_reminder_log DROP CONSTRAINT IF EXISTS guest_reminder_log_trigger_check;
ALTER TABLE guest_reminder_log ADD CONSTRAINT guest_reminder_log_trigger_check
  CHECK (trigger IN ('scheduled', 'manual', 'invitation'));
