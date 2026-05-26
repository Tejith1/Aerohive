-- Quick test to check if drone_pilots table exists and is accessible

-- Check if table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'drone_pilots';

-- If table exists, check structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'drone_pilots'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'drone_pilots';

-- Try to insert a test record (run this only if above queries work)
-- INSERT INTO drone_pilots (
--   full_name, email, phone, location, area, experience,
--   certifications, specializations, hourly_rate, about, dgca_number
-- ) VALUES (
--   'Test Pilot', 'test@example.com', '1234567890', 'Bangalore', 'Koramangala',
--   '3-5', 'DGCA Certified', 'Aerial Photography', 2000,
--   'Test pilot for database setup', 'DGCA123456'
-- );

-- Check if test record was inserted
-- SELECT * FROM drone_pilots WHERE email = 'test@example.com';
