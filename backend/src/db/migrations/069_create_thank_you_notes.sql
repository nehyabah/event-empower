-- The note a couple sends their guests once the wedding is over.
--
-- Kept as a saved draft rather than a fire-and-forget form: this is the last
-- thing a couple writes about their wedding and they will not get it right in
-- one sitting, so it is composed over days, previewed against the real guest
-- list, and only then sent.
CREATE TABLE thank_you_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  -- One photo, optional. A gallery belongs on their wedding site, which the
  -- note can link to; inline images are what gets a bulk send filed as spam.
  photo_url TEXT,
  -- 'attended' = guests who confirmed; 'all' = everyone invited with an email.
  audience VARCHAR(20) NOT NULL DEFAULT 'attended',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_thank_you_notes_user_id ON thank_you_notes(user_id, created_at DESC);

-- Per-guest outcome, so a couple can see who it actually reached.
CREATE TABLE thank_you_note_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES thank_you_notes(id) ON DELETE CASCADE,
  -- Kept if the guest is later deleted: the record of having written to them
  -- outlives the row on the guest list.
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name VARCHAR(200),
  email VARCHAR(255),
  status VARCHAR(20) NOT NULL,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_thank_you_recipients_note ON thank_you_note_recipients(note_id, created_at DESC);

-- A guest is thanked once per note. Only successful sends take the slot, so a
-- failed address can still be retried, but a retry can never write to someone
-- who already received it.
CREATE UNIQUE INDEX idx_thank_you_recipients_once
  ON thank_you_note_recipients(note_id, guest_id)
  WHERE guest_id IS NOT NULL AND status = 'sent';
