-- User wedding event configuration table
CREATE TABLE user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner1_name VARCHAR(255),
    partner2_name VARCHAR(255),
    event_date DATE,
    venue VARCHAR(255),
    total_budget DECIMAL(12, 2) DEFAULT 0,
    guest_count_estimate INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_user_events_user_id ON user_events(user_id);
