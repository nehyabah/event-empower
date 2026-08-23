-- Guest reminders could only run on a fixed cadence starting the moment they
-- were switched on. Couples also want to name the days themselves — a nudge
-- when invitations land, another a fortnight before the deadline — and to say
-- when a recurring schedule should begin.
ALTER TABLE guest_reminder_settings
  ADD COLUMN schedule_mode VARCHAR(20) NOT NULL DEFAULT 'recurring'
    CHECK (schedule_mode IN ('recurring', 'custom_dates')),
  -- First send for a recurring schedule. NULL means "start immediately".
  ADD COLUMN start_date DATE;

-- The chosen days, in custom_dates mode. sent_at records that a date has been
-- fulfilled so a restart or a second tick cannot re-send it.
CREATE TABLE guest_reminder_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    send_on DATE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, send_on)
);

CREATE INDEX idx_guest_reminder_dates_pending
  ON guest_reminder_dates(send_on)
  WHERE sent_at IS NULL;

CREATE INDEX idx_guest_reminder_dates_user ON guest_reminder_dates(user_id, send_on);
