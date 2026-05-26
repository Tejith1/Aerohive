-- Update script to add detailed product specifications
-- Add flight performance specifications
ALTER TABLE products ADD COLUMN IF NOT EXISTS flight_time VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_speed VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS range VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_altitude VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS wind_resistance VARCHAR(100);

-- Add power and physical specifications
ALTER TABLE products ADD COLUMN IF NOT EXISTS battery_capacity VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS charging_time VARCHAR(100);
-- Note: weight column already exists as DECIMAL, keeping existing
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions_text VARCHAR(100);

-- Add camera and gimbal specifications
ALTER TABLE products ADD COLUMN IF NOT EXISTS camera_resolution VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_resolution VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS gimbal_type VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS photo_modes VARCHAR(255);

-- Add compatibility columns for existing data
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE;

-- Create index for better performance on specification searches
CREATE INDEX IF NOT EXISTS idx_products_flight_specs ON products(flight_time, max_speed, range);
CREATE INDEX IF NOT EXISTS idx_products_camera_specs ON products(camera_resolution, video_resolution);