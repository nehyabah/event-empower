-- Add invite fields to planner_clients for planner-client linking
ALTER TABLE planner_clients
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS invite_status VARCHAR(20) CHECK (invite_status IN ('pending', 'accepted', 'revoked', 'expired')),
  ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS invite_accepted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_planner_clients_invite_code ON planner_clients(invite_code);
