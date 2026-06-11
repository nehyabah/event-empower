ALTER TABLE user_events
  ADD COLUMN planner_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_user_events_planner_id ON user_events(planner_id);
