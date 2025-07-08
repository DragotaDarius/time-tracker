-- Enable the auth schema extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a function to set custom claims
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set custom claims in the JWT
  PERFORM set_config('request.jwt.claims', 
    json_build_object(
      'sub', NEW.id,
      'email', NEW.email,
      'organization_id', COALESCE(NEW.raw_user_meta_data->>'organization_id', 'default')
    )::text, 
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set claims on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to use JWT claims
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    (auth.jwt() ->> 'organization_id')::uuid = organization_id
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    (auth.jwt() ->> 'organization_id')::uuid = organization_id
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
  ); 