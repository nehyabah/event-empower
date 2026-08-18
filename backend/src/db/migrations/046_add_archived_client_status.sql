ALTER TABLE planner_clients DROP CONSTRAINT IF EXISTS planner_clients_status_check;
ALTER TABLE planner_clients ADD CONSTRAINT planner_clients_status_check
  CHECK (status IN ('active', 'completed', 'upcoming', 'archived'));
