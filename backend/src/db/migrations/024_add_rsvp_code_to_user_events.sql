-- Add RSVP code to user_events for public guest RSVP submissions
ALTER TABLE user_events ADD COLUMN rsvp_code VARCHAR(12) UNIQUE;

-- Generate random RSVP codes for existing events
UPDATE user_events
SET rsvp_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE rsvp_code IS NULL;

-- Make rsvp_code NOT NULL after populating
ALTER TABLE user_events ALTER COLUMN rsvp_code SET NOT NULL;

-- Add index for fast lookup
CREATE INDEX idx_user_events_rsvp_code ON user_events(rsvp_code);
