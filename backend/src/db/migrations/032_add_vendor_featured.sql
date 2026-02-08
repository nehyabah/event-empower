-- Add is_featured column to vendor_profiles
ALTER TABLE vendor_profiles
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
