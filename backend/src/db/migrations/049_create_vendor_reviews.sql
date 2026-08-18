-- Vendor reviews: a couple may review a vendor they have actually used
-- (a vendor on their project roster with status 'booked' or 'confirmed').
-- One review per couple per vendor; editable.
CREATE TABLE vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_profile_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES user_events(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(150),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (vendor_profile_id, reviewer_user_id)
);

CREATE INDEX idx_vendor_reviews_vendor_profile_id ON vendor_reviews(vendor_profile_id);
CREATE INDEX idx_vendor_reviews_reviewer_user_id ON vendor_reviews(reviewer_user_id);

-- Keep vendor_profiles.rating + review_count in sync with the reviews table,
-- regardless of how reviews are written.
CREATE OR REPLACE FUNCTION refresh_vendor_rating() RETURNS TRIGGER AS $$
DECLARE
  target UUID := COALESCE(NEW.vendor_profile_id, OLD.vendor_profile_id);
BEGIN
  UPDATE vendor_profiles vp
  SET rating = COALESCE(agg.avg_rating, 0),
      review_count = COALESCE(agg.cnt, 0),
      updated_at = NOW()
  FROM (
    SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating, COUNT(*) AS cnt
    FROM vendor_reviews
    WHERE vendor_profile_id = target
  ) agg
  WHERE vp.id = target;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vendor_reviews_refresh
AFTER INSERT OR UPDATE OR DELETE ON vendor_reviews
FOR EACH ROW EXECUTE FUNCTION refresh_vendor_rating();
