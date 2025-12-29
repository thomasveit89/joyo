-- Fix RLS policies for project-assets storage bucket
-- Run this in Supabase SQL Editor

-- Note: Storage policies are managed separately from table policies
-- They use the storage.objects table

-- First, check if policies exist and drop them
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read published project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Allow users to upload files to their own folder in project-assets bucket
-- Path structure: {user_id}/{project_id}/{filename}
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to read files from published projects
-- This is more complex - we need to join with the projects table
CREATE POLICY "Anyone can read published project files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'project-assets'
  AND EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id::text = (storage.foldername(name))[2]
    AND projects.published = true
  )
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify the policies
SELECT
  polname as policy_name,
  polcmd as command,
  polpermissive as permissive,
  polroles::regrole[] as roles,
  pg_get_expr(polqual, polrelid) as using_clause,
  pg_get_expr(polwithcheck, polrelid) as with_check_clause
FROM pg_policy
WHERE polrelid = 'storage.objects'::regclass
  AND (
    polname LIKE '%own folder%'
    OR polname LIKE '%own files%'
    OR polname LIKE '%published project files%'
  )
ORDER BY polcmd, polname;
