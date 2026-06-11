-- Project vendor roster: links vendors to a couple's event
-- Both the couple and their planner can manage this list
CREATE TABLE project_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES user_events(id) ON DELETE CASCADE,
  vendor_profile_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'inquired'
    CHECK (status IN ('inquired', 'quoted', 'booked', 'confirmed', 'cancelled')),
  amount DECIMAL(12, 2),
  notes TEXT,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, vendor_profile_id)
);

CREATE INDEX idx_project_vendors_event_id ON project_vendors(event_id);
CREATE INDEX idx_project_vendors_vendor_profile_id ON project_vendors(vendor_profile_id);
