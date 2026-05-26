-- STEP 1: First, let's check if the table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'drone_pilots') THEN
        RAISE NOTICE 'Table drone_pilots does NOT exist. Please run the create-drone-pilots-table.sql script first.';
    ELSE
        RAISE NOTICE 'Table drone_pilots EXISTS!';
    END IF;
END
$$;

-- STEP 2: If table exists, let's test inserting a simple record
-- UNCOMMENT the lines below ONLY if the table exists:

/*
INSERT INTO public.drone_pilots (
    full_name, 
    email, 
    phone, 
    location, 
    area, 
    experience,
    certifications, 
    specializations, 
    hourly_rate, 
    about, 
    dgca_number
) VALUES (
    'Test Pilot', 
    'testpilot@example.com', 
    '+91 9876543210', 
    'Bangalore', 
    'Koramangala',
    '3-5',
    'DGCA Certified, Aerial Photography',
    'Real Estate, Wedding Photography',
    2500,
    'This is a test pilot profile to verify database setup.',
    'DGCA-TEST-12345'
) RETURNING *;
*/

-- STEP 3: If insert worked, verify we can read it
-- SELECT * FROM public.drone_pilots WHERE email = 'testpilot@example.com';

-- STEP 4: Clean up test data (run this after verifying)
-- DELETE FROM public.drone_pilots WHERE email = 'testpilot@example.com';
