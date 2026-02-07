-- 1. Create Profiles table for Instructor metadata
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  institution TEXT,
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add teacher_id to games table to link games to instructors
ALTER TABLE games ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users;

-- 3. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. Update RLS policies for games (more secure)
-- Note: You might want to remove the "Allow public select games" if you want games to be private to teachers,
-- but students still need to find a game by join code.
-- So we keep select public for join code, but restrict update/delete to the owner.

DROP POLICY IF EXISTS "Allow public update games" ON games;
DROP POLICY IF EXISTS "Allow public delete games" ON games;

CREATE POLICY "Instructors can update their own games" ON games
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Instructors can delete their own games" ON games
  FOR DELETE USING (auth.uid() = teacher_id);

CREATE POLICY "Instructors can insert games" ON games
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- Trigger to automatically create a profile after signup
-- This is optional but helps ensure a profile record exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
