-- Planner clients table for wedding planners to manage their client couples
CREATE TABLE IF NOT EXISTS planner_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner1_name VARCHAR(255) NOT NULL,
    partner2_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    event_type VARCHAR(50) DEFAULT 'Wedding',
    event_date DATE,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('active', 'completed', 'upcoming')),
    budget DECIMAL(12, 2),
    venue VARCHAR(255),
    guest_count INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_planner_clients_planner_id ON planner_clients(planner_id);
CREATE INDEX IF NOT EXISTS idx_planner_clients_status ON planner_clients(status);
CREATE INDEX IF NOT EXISTS idx_planner_clients_event_date ON planner_clients(event_date);
