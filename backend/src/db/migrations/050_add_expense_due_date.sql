-- Expenses carry a payment due date so couples can see what is owed and when.
-- `expense_date` records when the cost was incurred; `due_date` is when the
-- outstanding balance (amount - amount_paid) must be settled.
ALTER TABLE expenses ADD COLUMN due_date DATE;

-- Unsettled expenses ordered by what falls due next.
CREATE INDEX idx_expenses_user_due_date ON expenses(user_id, due_date)
  WHERE due_date IS NOT NULL;
