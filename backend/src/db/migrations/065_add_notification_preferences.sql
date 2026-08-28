-- Notification preferences for the settings page.
--
-- Login codes, password resets and booking updates are never gated by these -
-- they are the account working correctly, not marketing. These three cover
-- everything that is genuinely optional.
--
-- notify_newsletter defaults to false to match the published privacy policy,
-- which already promises newsletters are opt-in only.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_reminders BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_product_updates BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_newsletter BOOLEAN NOT NULL DEFAULT false;
