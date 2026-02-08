-- Allow admin user type
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_user_type_check;

ALTER TABLE users
  ADD CONSTRAINT users_user_type_check
  CHECK (user_type IN ('client', 'vendor', 'planner', 'admin'));
