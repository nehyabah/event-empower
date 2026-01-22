ALTER TABLE vendor_profiles
ADD COLUMN profile_image_url VARCHAR(500),
ADD COLUMN cover_image_url VARCHAR(500),
ADD COLUMN social_links JSONB DEFAULT '[]';
