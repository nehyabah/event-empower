-- Secret per-user token for the read-only ICS feed. Subscribing to the feed URL
-- in Google/Apple/Outlook Calendar keeps àjọyọ dates in sync and lets those
-- apps deliver the reminders.
ALTER TABLE users
  ADD COLUMN calendar_token UUID UNIQUE DEFAULT gen_random_uuid();

UPDATE users SET calendar_token = gen_random_uuid() WHERE calendar_token IS NULL;

-- The UNIQUE constraint above already provides the lookup index the ICS feed
-- needs, so no additional index is created here.
ALTER TABLE users ALTER COLUMN calendar_token SET NOT NULL;
