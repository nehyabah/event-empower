-- Anchor vendor inquiries and bookings to the couple's project (user_events row)
ALTER TABLE vendor_inquiries
  ADD COLUMN event_id UUID REFERENCES user_events(id) ON DELETE SET NULL;

ALTER TABLE vendor_bookings
  ADD COLUMN event_id UUID REFERENCES user_events(id) ON DELETE SET NULL;

CREATE INDEX idx_vendor_inquiries_event_id ON vendor_inquiries(event_id);
CREATE INDEX idx_vendor_bookings_event_id ON vendor_bookings(event_id);
