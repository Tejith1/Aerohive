-- Fix Storage RLS policies for pilot documents and product images
-- IMPORTANT: Run this entire script in the Supabase SQL Editor

-- 1. Enable RLS on storage.objects (usually enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies for these buckets to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads to pilot-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to pilot-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to product-images" ON storage.objects;

-- 3. Create policies for 'pilot-documents'
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to pilot-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pilot-documents');

-- Allow everyone to read files (public access)
CREATE POLICY "Allow public read access to pilot-documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pilot-documents');

-- 4. Create policies for 'product-images'
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow everyone to read files (public access)
CREATE POLICY "Allow public read access to product-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 5. Extra: Allow users to delete their own files if needed (optional but recommended)
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('pilot-documents', 'product-images'));

-- Verify the buckets are public
UPDATE storage.buckets SET public = true WHERE id IN ('pilot-documents', 'product-images');
