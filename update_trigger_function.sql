-- Update the trigger function to include institution and purpose
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, institution, purpose)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'institution',
    new.raw_user_meta_data->>'purpose'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
