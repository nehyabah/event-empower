-- Per-user, in-app notifications.
--
-- Distinct from notification_templates, which backs admin broadcasts. Until
-- now nothing told a vendor they had been added to a couple's roster or tagged
-- on a shared event — they had to notice a new name appear in a dropdown.
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    /** In-app path to open when the notification is clicked. */
    link VARCHAR(255),
    /** Who or what triggered it, for de-duplication and display. */
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_id UUID,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_notifications_user ON user_notifications(user_id, created_at DESC);

CREATE INDEX idx_user_notifications_unread
  ON user_notifications(user_id)
  WHERE read_at IS NULL;

-- One notification per user per thing: re-adding a vendor to the same event
-- should not stack up duplicates.
CREATE UNIQUE INDEX idx_user_notifications_dedupe
  ON user_notifications(user_id, type, entity_id)
  WHERE entity_id IS NOT NULL;
