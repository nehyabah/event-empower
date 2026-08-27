-- Six-digit codes for password reset, emailed to the account holder.
--
-- Separate from otp_codes: that table is keyed on a phone number and built for
-- sign-in, while these are keyed on a user and are single-use and higher-stakes.
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- bcrypt, never the code itself: a leaked database must not hand out
  -- working reset codes.
  code_hash   VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  -- Counted so a six-digit code cannot be brute-forced over many guesses.
  attempts    INTEGER NOT NULL DEFAULT 0,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Every lookup is "the live code for this user", so index that path.
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_user
  ON password_reset_codes (user_id, used_at, expires_at);
