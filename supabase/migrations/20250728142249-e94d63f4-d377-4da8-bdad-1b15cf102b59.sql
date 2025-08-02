-- Add missing location field to properties table
ALTER TABLE public.properties ADD COLUMN location TEXT;

-- Create admin user directly (bypassing email confirmation)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'jeremiahojogbe01@gmail.com',
  crypt('JJmiah1234', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User", "phone": "+234809604358"}',
  '',
  '',
  '',
  ''
);

-- Get the user ID and create admin profile
INSERT INTO public.profiles (id, full_name, phone, role)
SELECT 
  id,
  'Admin User',
  '+234809604358',
  'admin'::user_role
FROM auth.users 
WHERE email = 'jeremiahojogbe01@gmail.com';