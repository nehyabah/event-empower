-- Premium Wedding Website Builder: new columns & tables

ALTER TABLE couple_stories
  ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20),
  ADD COLUMN IF NOT EXISTS font_pair VARCHAR(50) DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '["hero","quote","couple","gallery","timeline","wedding-party","details","travel","wishes","registry","faq"]',
  ADD COLUMN IF NOT EXISTS hidden_sections JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS site_published BOOLEAN DEFAULT TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_couple_stories_slug ON couple_stories(slug) WHERE slug IS NOT NULL;

-- Timeline events
CREATE TABLE IF NOT EXISTS story_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT,
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user ON story_timeline_events(user_id);

-- Wedding party members
CREATE TABLE IF NOT EXISTS story_wedding_party (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    side VARCHAR(10) CHECK (side IN ('bride', 'groom', 'both')),
    bio TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wedding_party_user ON story_wedding_party(user_id);

-- Travel / accommodation info
CREATE TABLE IF NOT EXISTS story_travel_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category VARCHAR(30) DEFAULT 'hotel' CHECK (category IN ('hotel', 'transport', 'parking', 'other')),
    description TEXT,
    address TEXT,
    link TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_travel_info_user ON story_travel_info(user_id);

-- FAQ items
CREATE TABLE IF NOT EXISTS story_faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faq_items_user ON story_faq_items(user_id);
