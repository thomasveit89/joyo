-- Add language/locale support to projects and profiles
-- Migration: 003_add_language_support.sql

-- Add language field to projects table
-- This stores the language in which the gift experience content is created
ALTER TABLE projects
ADD COLUMN language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'de'));

-- Add preferred_language field to profiles table
-- This stores the user's preferred UI language
ALTER TABLE profiles
ADD COLUMN preferred_language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'de'));

-- Create index for faster language-based queries
CREATE INDEX idx_projects_language ON projects(language);
CREATE INDEX idx_profiles_preferred_language ON profiles(preferred_language);

-- Add comment for documentation
COMMENT ON COLUMN projects.language IS 'Language of the gift experience content (ISO 639-1 code)';
COMMENT ON COLUMN profiles.preferred_language IS 'User preferred UI language (ISO 639-1 code)';
