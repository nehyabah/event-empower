-- Idempotent: migration 015 was later edited to include `notes` directly, so on
-- a database built from scratch this column already exists by the time we get
-- here. Databases migrated incrementally still need it added.
ALTER TABLE vendor_inquiries
ADD COLUMN IF NOT EXISTS notes TEXT;
