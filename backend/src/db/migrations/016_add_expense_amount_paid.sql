ALTER TABLE expenses
ADD COLUMN amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0;

UPDATE expenses
SET amount_paid = amount
WHERE paid = true AND amount_paid = 0;

ALTER TABLE expenses
ADD CONSTRAINT expenses_amount_paid_non_negative CHECK (amount_paid >= 0),
ADD CONSTRAINT expenses_amount_paid_max CHECK (amount_paid <= amount);
