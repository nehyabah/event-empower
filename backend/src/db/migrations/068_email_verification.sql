-- Proving a signup owns the address it registered with.
--
-- Until now nothing verified it: register checked the address was not taken,
-- created the account and signed the person straight in. A typo left someone
-- unable to reset their password because the code went to a stranger, and
-- registering someone else's address squatted it permanently, since duplicate
-- emails are rejected.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Its own table rather than reusing email_login_codes, for the same reason
-- that table is separate from password_reset_codes: sharing one would let a
-- verification code be replayed as a sign-in.
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash   VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_user
  ON email_verification_codes (user_id, used_at, expires_at);

-- Everyone who signed up before this existed is treated as verified. They
-- have been using these accounts, and locking them out of messaging to prove
-- an address they already receive mail on would punish them for our gap.
-- Google accounts are verified by Google, and anyone who has signed in with
-- an emailed code has already demonstrated they receive mail there.
UPDATE users
   SET email_verified_at = COALESCE(created_at, NOW())
 WHERE email IS NOT NULL
   AND email_verified_at IS NULL;
