-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (
    id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage organizations" ON organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND organization_id = organizations.id
    )
  );

-- User profiles policies
CREATE POLICY "Users can view org members" ON user_profiles
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage users" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND organization_id = user_profiles.organization_id
    )
  );

-- Projects policies
CREATE POLICY "Users can view org projects" ON projects
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND organization_id = projects.organization_id
    )
  );

-- Work sessions policies
CREATE POLICY "Users can view own sessions" ON work_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view team sessions" ON work_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = work_sessions.user_id
      )
    )
  );

CREATE POLICY "Users can create own sessions" ON work_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON work_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all sessions" ON work_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = work_sessions.user_id
      )
    )
  );

-- Breaks policies
CREATE POLICY "Users can view own breaks" ON breaks
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM work_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can view team breaks" ON breaks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND organization_id = (
        SELECT organization_id FROM user_profiles 
        WHERE id = (
          SELECT user_id FROM work_sessions WHERE id = breaks.session_id
        )
      )
    )
  );

CREATE POLICY "Users can create breaks for own sessions" ON breaks
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM work_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own breaks" ON breaks
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM work_sessions WHERE user_id = auth.uid()
    )
  );

-- Tasks policies
CREATE POLICY "Users can view org tasks" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can update assigned tasks" ON tasks
  FOR UPDATE USING (assigned_to = auth.uid());

CREATE POLICY "Admins can manage all tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND organization_id = (
        SELECT organization_id FROM projects WHERE id = tasks.project_id
      )
    )
  ); 