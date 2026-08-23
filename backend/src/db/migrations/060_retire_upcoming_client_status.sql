-- Client status is active / completed / archived.
--
-- 'upcoming' was the default every client was created with, and nothing in the
-- app could move them off it — so the Active and Completed views were always
-- empty while every client sat in a status that carried no meaning.
UPDATE planner_clients SET status = 'active' WHERE status = 'upcoming';

ALTER TABLE planner_clients DROP CONSTRAINT IF EXISTS planner_clients_status_check;

ALTER TABLE planner_clients
  ADD CONSTRAINT planner_clients_status_check
  CHECK (status IN ('active', 'completed', 'archived'));

-- New clients start active rather than in limbo.
ALTER TABLE planner_clients ALTER COLUMN status SET DEFAULT 'active';
