-- Update existing admin user or create if not exists using email lookup
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- First, try to find existing user by email
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'grpg.info@gmail.com';
    
    -- If user doesn't exist, create a new one
    IF user_uuid IS NULL THEN
        user_uuid := gen_random_uuid();
        
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
            user_uuid,
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
        );
    ELSE
        -- Update existing user
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('Test1234', gen_salt('bf')),
            email_confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = user_uuid;
    END IF;
    
    -- Create or update profile
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        user_uuid,
        'Admin User',
        '+234809604358',
        'admin'::user_role
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin'::user_role,
        full_name = 'Admin User',
        phone = '+234809604358';
        
END $$;