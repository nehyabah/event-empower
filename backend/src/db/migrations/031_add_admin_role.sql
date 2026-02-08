-- Add admin_role column to users table
-- Roles: super_admin, admin, support, analyst
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS admin_role VARCHAR(20) DEFAULT NULL;

-- Set existing admin users to 'admin' role
UPDATE users SET admin_role = 'admin' WHERE user_type = 'admin' AND admin_role IS NULL;

-- Add check constraint for valid admin roles
ALTER TABLE users
  ADD CONSTRAINT chk_admin_role
  CHECK (admin_role IS NULL OR admin_role IN ('super_admin', 'admin', 'support', 'analyst'));
