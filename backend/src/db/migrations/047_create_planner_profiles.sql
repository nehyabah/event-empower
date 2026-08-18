CREATE TABLE IF NOT EXISTS planner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  tagline VARCHAR(255),
  location VARCHAR(255),
  website VARCHAR(500),
  years_of_experience INTEGER,
  specializations TEXT[],
  profile_image_url TEXT,
  cover_image_url TEXT,
  phone VARCHAR(50),
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  twitter VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planner_profiles_user_id ON planner_profiles(user_id);
