-- Fix RLS policies for assets table - Version 2
-- This version ensures the WITH CHECK clause is properly set

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON assets;
DROP POLICY IF EXISTS "Anyone can view published project assets" ON assets;

-- Recreate the INSERT policy with proper WITH CHECK
CREATE POLICY "Users can insert own assets"
ON assets
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

-- Recreate SELECT policies
CREATE POLICY "Users can view own assets"
ON assets
FOR SELECT
TO public
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published project assets"
ON assets
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = assets.project_id
    AND projects.published = true
  )
);

-- Recreate DELETE policy
CREATE POLICY "Users can delete own assets"
ON assets
FOR DELETE
TO public
USING (auth.uid() = user_id);

-- Verify the policies are correctly set
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'assets'
ORDER BY cmd, policyname;
