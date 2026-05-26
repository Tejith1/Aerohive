-- Test if image_storage table exists
-- Run this to check if the table was created successfully

SELECT 
    table_name, 
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'image_storage' 
AND table_schema = 'public';

-- If the above query returns a row, the table exists
-- If it returns no rows, you need to create the table first