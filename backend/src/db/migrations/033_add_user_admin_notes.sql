-- Add admin_notes column to users table for internal admin notes
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT NULL;
