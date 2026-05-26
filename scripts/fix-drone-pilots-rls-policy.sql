-- Fix RLS policy to allow anonymous registrations
-- IMPORTANT: Run this entire script in Supabase SQL Editor

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to insert pilot profile" ON public.drone_pilots;
DROP POLICY IF EXISTS "Allow anyone to register as pilot" ON public.drone_pilots;

-- Step 2: Grant necessary permissions to anonymous users
GRANT INSERT ON public.drone_pilots TO anon;
GRANT SELECT ON public.drone_pilots TO anon;

-- Step 3: Create new policy that allows anonymous inserts
CREATE POLICY "Allow anyone to register as pilot"
ON public.drone_pilots
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Step 4: Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'drone_pilots' AND policyname = 'Allow anyone to register as pilot';

-- Note: This allows anyone to register. The 'is_verified' flag ensures
-- only admin-approved pilots appear in the public directory.
-- If you want more security, you can add authentication later.
