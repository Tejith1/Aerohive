-- Fix image_url columns to support data URLs
-- Run this to allow storing data URLs directly in the database

-- Update products table to support data URLs (can be very long)
ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;

-- Update categories table to support data URLs
ALTER TABLE categories ALTER COLUMN image_url TYPE TEXT;

-- Add comment
COMMENT ON COLUMN products.image_url IS 'Image URL or data URL for product image';
COMMENT ON COLUMN categories.image_url IS 'Image URL or data URL for category image';