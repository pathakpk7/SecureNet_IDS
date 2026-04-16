-- PART 1: CREATE ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PART 2: CREATE PROFILE TABLE WITH ORG SUPPORT
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- PART 3: ENABLE RLS (SECURITY CORE) FOR ORGANIZATIONS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- PART 4: ORGANIZATION POLICIES
CREATE POLICY "Organization owners can view their org"

-- PART 5: PROFILE POLICIES WITH PERMISSIONS
CREATE POLICY "Users can view profiles in their organization"
ON profiles
FOR SELECT
USING (organizations org_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Admins can manage all users in their organization"
ON profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Users with specific permissions can access organization features"
ON profiles
FOR SELECT
USING (organizations org_id = auth.uid())
AND (
  permissions->>'canManageUsers' = 'true'
  OR permissions->>'canManageOrgSettings' = 'true'
);

-- PART 6: ALERTS POLICIES WITH PERMISSIONS
CREATE POLICY "Users can view alerts in their organization"
ON alerts
FOR SELECT
USING (organizations org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can manage alerts in their organization"
ON alerts
FOR ALL
USING (
  organizations org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  )
  AND permissions->>'canManageUsers' = 'true'
);
ON organizations
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Organization owners can update their org"
ON organizations
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Organization owners can delete their org"

-- PART 5: PROFILE POLICIES WITH PERMISSIONS
CREATE POLICY "Users can view profiles in their organization"
ON profiles
FOR SELECT
USING (organizations org_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Admins can manage all users in their organization"
ON profiles
FOR ALL
USING (
  organizations org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  )
  AND permissions->>'canManageUsers' = 'true'
);

-- PART 6: ALERTS POLICIES WITH PERMISSIONS
CREATE POLICY "Users can view alerts in their organization"
ON alerts
FOR SELECT
USING (organizations org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can manage alerts in their organization"
ON alerts
FOR ALL
USING (
  organizations org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  )
  AND permissions->>'canManageUsers' = 'true'
);
ON organizations
FOR DELETE
USING (auth.uid() = owner_id);

-- PART 5: ENABLE RLS (SECURITY CORE) FOR PROFILES

-- PART 7: CREATE AUDIT LOG TABLE
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  org_id uuid,
  action text,
  target text,
  metadata jsonb,
  created_at timestamp DEFAULT now()
);

-- PART 8: ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- PART 6: PROFILE POLICIES WITH ORG SUPPORT
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles in their org"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND org_id = profiles.org_id
  )
);

CREATE POLICY "Admin can update users in their org"
ON profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND org_id = profiles.org_id
  )
);

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
USING (auth.uid() = id);

-- PART 7: ADD ROLE TO ALERTS TABLE WITH ORG SUPPORT
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts in their org"
ON alerts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND org_id = alerts.org_id
  )
);

CREATE POLICY "Only admin can modify alerts in their org"
ON alerts
FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND org_id = alerts.org_id
  )
);
