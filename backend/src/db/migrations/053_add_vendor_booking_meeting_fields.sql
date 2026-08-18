-- Vendors schedule meetings, site visits and setups — not just whole-day
-- bookings — so bookings gain a title, times, a location and a booking kind.
ALTER TABLE vendor_bookings
  ADD COLUMN title VARCHAR(255),
  ADD COLUMN start_time TIME,
  ADD COLUMN end_time TIME,
  ADD COLUMN location VARCHAR(255),
  ADD COLUMN booking_kind VARCHAR(20) NOT NULL DEFAULT 'booking'
    CHECK (booking_kind IN ('booking', 'meeting', 'consultation', 'site_visit', 'setup', 'other'));

-- Existing rows read as a booking for the named client.
UPDATE vendor_bookings
SET title = client_name || ' — ' || COALESCE(event_type, 'Event')
WHERE title IS NULL;

CREATE INDEX idx_vendor_bookings_kind ON vendor_bookings(vendor_id, booking_kind);
