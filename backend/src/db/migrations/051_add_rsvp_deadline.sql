-- RSVP deadlines: couples set a date after which the public RSVP link stops
-- accepting responses. `rsvp_closed` lets them close early (or reopen) without
-- having to move the date.
ALTER TABLE user_events
  ADD COLUMN rsvp_deadline DATE,
  ADD COLUMN rsvp_message TEXT,
  ADD COLUMN rsvp_closed BOOLEAN NOT NULL DEFAULT FALSE;

-- Records how each guest responded so a returning guest sees their own answer
-- even after the deadline has passed.
ALTER TABLE guests
  ADD COLUMN rsvp_responded_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN guest_count INTEGER NOT NULL DEFAULT 1;
