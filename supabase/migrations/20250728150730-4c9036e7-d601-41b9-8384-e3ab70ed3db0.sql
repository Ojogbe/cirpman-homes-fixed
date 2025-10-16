-- Create admin user with email grpg.info@gmail.com and password Test1234
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
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'grpg.info@gmail.com',
  crypt('Test1234', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('Test1234', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- Create profile for the admin user
INSERT INTO public.profiles (id, full_name, phone, role)
SELECT 
  id,
  'Admin User',
  '+234809604358',
  'admin'::user_role
FROM auth.users 
WHERE email = 'grpg.info@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin'::user_role,
  full_name = 'Admin User',
  phone = '+234809604358';