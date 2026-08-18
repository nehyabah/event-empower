-- Guest reminder scheduling. A couple picks a cadence and the backend scheduler
-- sends RSVP nudges to guests who have not yet responded.
CREATE TABLE guest_reminder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    frequency VARCHAR(20) NOT NULL DEFAULT 'weekly'
      CHECK (frequency IN ('daily', 'every_3_days', 'weekly', 'biweekly', 'monthly')),
    channel VARCHAR(20) NOT NULL DEFAULT 'email'
      CHECK (channel IN ('email', 'sms', 'both')),
    -- Only nudge guests still sitting on these statuses.
    target_statuses TEXT[] NOT NULL DEFAULT ARRAY['pending', 'maybe'],
    custom_message TEXT,
    -- Stop reminding once the event is this many days away (0 = keep going).
    stop_days_before INTEGER NOT NULL DEFAULT 0,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guest_reminder_settings_due
  ON guest_reminder_settings(next_send_at)
  WHERE enabled = TRUE;

-- One row per delivery attempt: powers the "last sent" UI and stops a guest
-- being emailed twice by two scheduler ticks.
CREATE TABLE guest_reminder_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    channel VARCHAR(20) NOT NULL,
    destination VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'skipped')),
    error TEXT,
    trigger VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (trigger IN ('scheduled', 'manual')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guest_reminder_log_user_sent ON guest_reminder_log(user_id, sent_at DESC);
CREATE INDEX idx_guest_reminder_log_guest ON guest_reminder_log(guest_id, sent_at DESC);

-- Advisory-style claim lock so only one backend instance runs a given
-- scheduler tick, even if the service is scaled to several replicas.
CREATE TABLE scheduler_locks (
    name VARCHAR(64) PRIMARY KEY,
    locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
    locked_by VARCHAR(128),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
