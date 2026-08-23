-- Backfill the link between a planner's CRM record and the couple's event.
--
-- Migration 040 added planner_clients.event_id but nothing ever populated it,
-- so it was NULL for every row. The client-project endpoints (add / update /
-- remove a client's vendors) all key off it, which meant a planner could never
-- manage the vendor roster of a couple who had accepted their invite.
UPDATE planner_clients pc
SET event_id = ue.id
FROM user_events ue
WHERE pc.user_id = ue.user_id
  AND pc.event_id IS NULL;

-- The reverse link, read by the calendar and workspace access checks. Only
-- filled where the couple has no planner recorded yet, so an existing
-- assignment is never overwritten.
UPDATE user_events ue
SET planner_id = pc.planner_id
FROM planner_clients pc
WHERE pc.user_id = ue.user_id
  AND pc.invite_status = 'accepted'
  AND ue.planner_id IS NULL;
