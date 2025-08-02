-- Add missing location field to properties table  
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS location TEXT;

-- Update existing admin user password and confirm email
UPDATE auth.users 
SET 
  encrypted_password = crypt('JJmiah1234', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'jeremiahojogbe01@gmail.com';

-- Ensure admin profile exists
INSERT INTO public.profiles (id, full_name, phone, role)
SELECT 
  id,
  'Admin User',
  '+234809604358',
  'admin'::user_role
FROM auth.users 
WHERE email = 'jeremiahojogbe01@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin'::user_role,
  full_name = 'Admin User',
  phone = '+234809604358';