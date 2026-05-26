-- Image Storage Table for handling long URLs
-- Run this script to create the image_storage table

CREATE TABLE IF NOT EXISTS image_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_url TEXT NOT NULL,
    short_id VARCHAR(50) UNIQUE NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_image_storage_short_id ON image_storage(short_id);
CREATE INDEX IF NOT EXISTS idx_image_storage_original_url ON image_storage(original_url);

-- Add some comments
COMMENT ON TABLE image_storage IS 'Stores long image URLs with short reference IDs';
COMMENT ON COLUMN image_storage.original_url IS 'The full original image URL (can be very long)';
COMMENT ON COLUMN image_storage.short_id IS 'Short reference ID used in products table';
COMMENT ON COLUMN image_storage.file_size IS 'File size in bytes (if known)';
COMMENT ON COLUMN image_storage.mime_type IS 'MIME type of the image';