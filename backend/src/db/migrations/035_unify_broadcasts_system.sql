-- Add template_id and cancelled_at to admin_broadcasts
ALTER TABLE admin_broadcasts
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_admin_broadcasts_template_id ON admin_broadcasts(template_id);
CREATE INDEX IF NOT EXISTS idx_admin_broadcasts_audience ON admin_broadcasts(audience);
CREATE INDEX IF NOT EXISTS idx_admin_broadcasts_status ON admin_broadcasts(status);
