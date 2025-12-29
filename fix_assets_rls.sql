-- Fix RLS policies for assets table
-- Run this in Supabase SQL Editor if you're having RLS issues

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON assets;
DROP POLICY IF EXISTS "Anyone can view published project assets" ON assets;

-- Recreate policies with explicit type casting
CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own assets" ON assets
  FOR DELETE USING (auth.uid()::uuid = user_id);

-- Anyone can view assets for published projects
CREATE POLICY "Anyone can view published project assets" ON assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = assets.project_id
      AND projects.published = true
    )
  );

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'assets';
