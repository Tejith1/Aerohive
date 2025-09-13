-- Database Migration Script to Fix Image URL Length Issue
-- Run this in your Supabase SQL Editor to fix the varchar length constraint

-- This fixes the "value too long for database varchar" error when uploading images

-- Step 1: Update products table image_url column to support unlimited length
ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;

-- Step 2: Update categories table image_url column to support unlimited length  
ALTER TABLE categories ALTER COLUMN image_url TYPE TEXT;

-- Step 3: Add comments for documentation
COMMENT ON COLUMN products.image_url IS 'Image URL or data URL for product image (supports data URLs)';
COMMENT ON COLUMN categories.image_url IS 'Image URL or data URL for category image (supports data URLs)';

-- Step 4: Create image_storage table if it doesn't exist (for URL shortening)
CREATE TABLE IF NOT EXISTS image_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_url TEXT NOT NULL,
    short_id VARCHAR(50) UNIQUE NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create stored_images table if it doesn't exist (for direct storage)
CREATE TABLE IF NOT EXISTS stored_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER,
    image_data TEXT NOT NULL, -- Base64 encoded image data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_image_storage_short_id ON image_storage(short_id);
CREATE INDEX IF NOT EXISTS idx_stored_images_id ON stored_images(id);

-- Step 7: Enable RLS on stored_images if not already enabled
ALTER TABLE stored_images ENABLE ROW LEVEL SECURITY;

-- Step 8: Create policies for stored_images if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stored_images' 
        AND policyname = 'Allow read access to all'
    ) THEN
        CREATE POLICY "Allow read access to all" ON stored_images
        FOR SELECT USING (true);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stored_images' 
        AND policyname = 'Allow insert for authenticated users'
    ) THEN
        CREATE POLICY "Allow insert for authenticated users" ON stored_images
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END$$;

-- Verification queries to check the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name IN ('products', 'categories') 
AND column_name = 'image_url';

SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('image_storage', 'stored_images');

COMMENT ON SCRIPT IS 'Migration script to fix image URL length constraints - resolves "value too long for database varchar" errors';