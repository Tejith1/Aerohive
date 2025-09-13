-- Direct Image Storage Table
-- This stores the actual image data in the database instead of URLs

CREATE TABLE IF NOT EXISTS stored_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER,
    image_data TEXT NOT NULL, -- Base64 encoded image data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stored_images_id ON stored_images(id);
CREATE INDEX IF NOT EXISTS idx_stored_images_filename ON stored_images(filename);

-- Enable Row Level Security
ALTER TABLE stored_images ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow read access to all" ON stored_images
FOR SELECT USING (true);

-- Allow insert for authenticated users  
CREATE POLICY "Allow insert for authenticated users" ON stored_images
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add comments
COMMENT ON TABLE stored_images IS 'Stores actual image data as base64 in the database';
COMMENT ON COLUMN stored_images.image_data IS 'Base64 encoded image data';
COMMENT ON COLUMN stored_images.filename IS 'Original filename or generated name';
COMMENT ON COLUMN stored_images.mime_type IS 'MIME type of the image (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN stored_images.file_size IS 'Size of the original image in bytes';