-- Create admin user
-- Run this in your Supabase SQL Editor

-- First, create the admin user in Supabase Auth
-- This will be done through the frontend registration

-- Insert admin user profile into users table
-- Note: The id should match the Supabase Auth user id
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    is_admin,
    is_active
) VALUES (
    gen_random_uuid(), -- This will be replaced with the actual auth user id
    'admin1@gmail.com',
    'Admin',
    'User',
    true,
    true
) ON CONFLICT (email) DO UPDATE SET
    is_admin = true,
    is_active = true;