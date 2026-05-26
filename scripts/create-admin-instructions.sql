-- Instructions to create admin user manually

-- STEP 1: First, register a new user through your frontend registration form with:
-- Email: admin1@gmail.com  
-- Password: #Tejith13
-- First Name: Admin
-- Last Name: User

-- STEP 2: Then run this SQL in your Supabase SQL Editor to promote the user to admin:

UPDATE users 
SET is_admin = true 
WHERE email = 'admin1@gmail.com';

-- STEP 3: Verify the admin user was created:
SELECT id, email, first_name, last_name, is_admin, is_active 
FROM users 
WHERE email = 'admin1@gmail.com';

-- The user should now have is_admin = true
-- When they login, they will be redirected to /admin automatically