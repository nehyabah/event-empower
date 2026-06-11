-- Link each planner_clients CRM record to the couple's canonical user_events row.
-- Once populated, the planner reads event details from user_events directly
-- instead of from the duplicated columns on planner_clients.
ALTER TABLE planner_clients
  ADD COLUMN event_id UUID REFERENCES user_events(id) ON DELETE SET NULL;

CREATE INDEX idx_planner_clients_event_id ON planner_clients(event_id);
