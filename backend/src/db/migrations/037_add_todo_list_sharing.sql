ALTER TABLE todo_lists ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_todo_lists_user_id_shared ON todo_lists(user_id, is_shared);
