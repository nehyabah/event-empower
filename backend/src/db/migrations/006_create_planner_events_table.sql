-- Planner events/calendar table for wedding planners to manage their schedule
CREATE TABLE IF NOT EXISTS planner_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES planner_clients(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    event_type VARCHAR(50) DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'visit', 'rehearsal', 'wedding', 'consultation', 'other')),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_planner_events_planner_id ON planner_events(planner_id);
CREATE INDEX IF NOT EXISTS idx_planner_events_client_id ON planner_events(client_id);
CREATE INDEX IF NOT EXISTS idx_planner_events_event_date ON planner_events(event_date);
CREATE INDEX IF NOT EXISTS idx_planner_events_event_type ON planner_events(event_type);
