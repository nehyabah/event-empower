-- Group chat for a wedding workspace: the couple, their planner, and any
-- vendor on the roster share one thread per wedding.
CREATE TABLE workspace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES user_events(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workspace_messages_event_id ON workspace_messages(event_id, created_at);
