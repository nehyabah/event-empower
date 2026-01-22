-- Vendor bookings table
CREATE TABLE vendor_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_type VARCHAR(100) DEFAULT 'Wedding',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    total_amount DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendor_bookings_vendor_id ON vendor_bookings(vendor_id);
CREATE INDEX idx_vendor_bookings_client_id ON vendor_bookings(client_id);
CREATE INDEX idx_vendor_bookings_event_date ON vendor_bookings(event_date);
