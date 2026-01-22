ALTER TABLE todo_items
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'todo'
CHECK (status IN ('todo', 'in_progress', 'done'));

UPDATE todo_items
SET status = CASE
  WHEN completed = true THEN 'done'
  ELSE 'todo'
END
WHERE status IS NULL OR status = '';
