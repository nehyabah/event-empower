CREATE SEQUENCE IF NOT EXISTS support_ticket_number_seq START WITH 1000;

ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS ticket_number BIGINT;

ALTER TABLE support_tickets
  ALTER COLUMN ticket_number SET DEFAULT nextval('support_ticket_number_seq');

UPDATE support_tickets
SET ticket_number = nextval('support_ticket_number_seq')
WHERE ticket_number IS NULL;

ALTER TABLE support_tickets
  ALTER COLUMN ticket_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_support_tickets_ticket_number
ON support_tickets(ticket_number);
