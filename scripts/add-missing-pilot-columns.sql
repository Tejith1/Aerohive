-- Add missing columns to drone_pilots table
-- Run this in Supabase SQL Editor

ALTER TABLE public.drone_pilots 
ADD COLUMN IF NOT EXISTS drone_academy VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'drone_pilots'
AND column_name IN ('drone_academy', 'is_phone_verified', 'latitude', 'longitude');
