-- Wedding expense tracking table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'venue', 'catering', 'attire', 'decoration', 'photography',
        'music', 'transportation', 'accommodation', 'invitations',
        'rings', 'gifts', 'beauty', 'other'
    )),
    expense_date DATE,
    paid BOOLEAN DEFAULT false,
    notes TEXT,
    vendor_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_paid ON expenses(paid);
