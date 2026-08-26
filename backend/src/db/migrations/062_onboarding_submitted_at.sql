-- Marks the moment a vendor or planner first completed their profile for
-- review, so the "submitted for approval" email fires once rather than on
-- every subsequent save.
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_submitted_at TIMESTAMPTZ;
