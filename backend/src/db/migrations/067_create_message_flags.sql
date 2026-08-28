-- Blocked attempts to exchange contact details in chat.
--
-- Recorded rather than silently dropped: a single mistake is not worth acting
-- on, but a pattern across many conversations is exactly what an admin needs
-- to see before deciding to disable an account. The attempted text is kept so
-- a human can judge intent - a venue address reads very differently from a
-- phone number spelled out in words.
CREATE TABLE message_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  surface VARCHAR(30) NOT NULL,
  context_id UUID,
  violations TEXT[] NOT NULL DEFAULT '{}',
  attempted_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_message_flags_user_id ON message_flags(user_id, created_at DESC);
CREATE INDEX idx_message_flags_created_at ON message_flags(created_at DESC);
