ALTER TABLE vendor_profiles
ALTER COLUMN profile_image_url TYPE TEXT,
ALTER COLUMN cover_image_url TYPE TEXT;

ALTER TABLE vendor_images
ALTER COLUMN url TYPE TEXT;
