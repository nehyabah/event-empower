-- Six-digit codes for signing in without a password.
--
-- Separate from password_reset_codes even though the shape matches: the two
-- have different lifetimes and different blast radius if abused, and folding
-- them into one table would mean a reset code could be replayed as a login.
CREATE TABLE IF NOT EXISTS email_login_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash   VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_login_codes_user
  ON email_login_codes (user_id, used_at, expires_at);
