-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (Gifts)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL DEFAULT 'playful-pastel',
  published BOOLEAN DEFAULT FALSE,
  share_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nodes (Screens in the flow)
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'hero', 'choice', 'text-input', 'reveal', 'media', 'end'
  order_index INTEGER NOT NULL,
  content JSONB NOT NULL, -- Flexible content structure per node type
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, order_index)
);

-- Sessions (Recipient progress)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  answers JSONB DEFAULT '[]'::jsonb, -- Array of { nodeId, answer, timestamp }
  metadata JSONB DEFAULT '{}'::jsonb -- Browser info, referrer, etc.
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_share_slug ON projects(share_slug);
CREATE INDEX idx_nodes_project_id ON nodes(project_id);
CREATE INDEX idx_nodes_order ON nodes(project_id, order_index);
CREATE INDEX idx_sessions_project_id ON sessions(project_id);
CREATE INDEX idx_sessions_completed ON sessions(completed);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/update their own
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects: Users can CRUD their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Published projects are viewable by anyone via share_slug
CREATE POLICY "Anyone can view published projects" ON projects
  FOR SELECT USING (published = true);

-- Nodes: Tied to project permissions
CREATE POLICY "Users can view own project nodes" ON nodes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = nodes.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can insert nodes for own projects" ON nodes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = nodes.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can update own project nodes" ON nodes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = nodes.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own project nodes" ON nodes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = nodes.project_id AND projects.user_id = auth.uid())
  );

-- Anyone can view nodes for published projects
CREATE POLICY "Anyone can view published project nodes" ON nodes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = nodes.project_id AND projects.published = true)
  );

-- Sessions: Anonymous users can create sessions for published projects
CREATE POLICY "Anyone can create sessions for published projects" ON sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = sessions.project_id AND projects.published = true)
  );

CREATE POLICY "Anyone can update own sessions" ON sessions
  FOR UPDATE USING (true); -- Sessions are anonymous, allow updates

-- Project owners can view sessions for their projects
CREATE POLICY "Project owners can view sessions" ON sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = sessions.project_id AND projects.user_id = auth.uid())
  );

-- Function to auto-generate share_slug on publish
CREATE OR REPLACE FUNCTION generate_share_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND NEW.share_slug IS NULL THEN
    NEW.share_slug := encode(gen_random_bytes(8), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_share_slug
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_share_slug();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
