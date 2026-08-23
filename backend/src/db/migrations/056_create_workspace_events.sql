-- Shared events on a wedding's workspace calendar.
--
-- Distinct from the existing calendars: planner_events belong to a planner and
-- vendor_bookings to a vendor, whereas these belong to the wedding itself and
-- can be created by anyone working on it — the couple, their planner, or a
-- vendor on their roster.
CREATE TABLE workspace_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- The wedding this event sits on.
    event_id UUID NOT NULL REFERENCES user_events(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    event_type VARCHAR(50) NOT NULL DEFAULT 'meeting'
      CHECK (event_type IN ('meeting', 'visit', 'fitting', 'tasting', 'rehearsal', 'delivery', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workspace_events_event_id ON workspace_events(event_id, event_date);
CREATE INDEX idx_workspace_events_created_by ON workspace_events(created_by);

-- People tagged on an event. A tagged user sees it on their own calendar and
-- ICS feed, read-only unless they created it.
CREATE TABLE workspace_event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_event_id UUID NOT NULL REFERENCES workspace_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (workspace_event_id, user_id)
);

CREATE INDEX idx_workspace_event_participants_user ON workspace_event_participants(user_id);
