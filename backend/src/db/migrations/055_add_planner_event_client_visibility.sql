-- Planner calendar entries sync through to the linked client's calendar unless
-- the planner marks them internal.
ALTER TABLE planner_events
  ADD COLUMN visible_to_client BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX idx_planner_events_client_visible
  ON planner_events(client_id, event_date)
  WHERE visible_to_client = TRUE;
