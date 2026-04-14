-- PART 1: CREATE PROFILE TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- PART 2: AUTO CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- PART 3: ENABLE RLS (SECURITY CORE)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- PART 4: POLICY: USER CAN READ OWN PROFILE
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- PART 5: POLICY: ADMIN CAN READ ALL
CREATE POLICY "Admin can view all profiles"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- PART 6: POLICY: ADMIN UPDATE USERS
CREATE POLICY "Admin can update users"
ON profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- PART 7: ADD ROLE TO ALERTS TABLE
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts"
ON alerts
FOR SELECT
USING (true);

CREATE POLICY "Only admin can modify alerts"
ON alerts
FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
