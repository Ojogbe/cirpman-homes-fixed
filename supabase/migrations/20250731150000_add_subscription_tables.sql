-- Add subscription tables for Phase 2 features

-- Create customer_subscriptions table
CREATE TABLE IF NOT EXISTS public.customer_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Personal Information
    surname TEXT NOT NULL,
    middle_name TEXT,
    first_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    marital_status TEXT NOT NULL,
    contact_address TEXT NOT NULL,
    email TEXT NOT NULL,
    occupation TEXT NOT NULL,
    referred_by TEXT,
    designation TEXT,
    phone TEXT NOT NULL,
    
    -- Package & Payment
    selected_packages TEXT[] NOT NULL,
    duration TEXT NOT NULL,
    payment_plan TEXT NOT NULL,
    plot_size TEXT NOT NULL,
    number_of_plots TEXT NOT NULL,
    
    -- Next of Kin
    next_of_kin_surname TEXT NOT NULL,
    next_of_kin_other_names TEXT NOT NULL,
    next_of_kin_address TEXT NOT NULL,
    next_of_kin_phone TEXT NOT NULL,
    next_of_kin_id_number TEXT,
    next_of_kin_relationship TEXT NOT NULL,
    
    -- Digital Signature
    digital_signature TEXT NOT NULL,
    date DATE NOT NULL,
    
    -- Files
    passport_photo_url TEXT,
    
    -- Installment Preview
    installment_preview JSONB,
    
    -- Status
    status TEXT DEFAULT 'pending' NOT NULL,
    
    -- Payment Information
    payment_reference TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_amount DECIMAL(12,2),
    payment_date TIMESTAMP WITH TIME ZONE
);

-- Create consultant_subscriptions table
CREATE TABLE IF NOT EXISTS public.consultant_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Personal Information
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    marital_status TEXT NOT NULL,
    contact_address TEXT NOT NULL,
    email TEXT NOT NULL,
    occupation TEXT NOT NULL,
    employer TEXT,
    referred_by TEXT,
    designation TEXT,
    placement TEXT,
    phone TEXT NOT NULL,
    id_number TEXT NOT NULL,
    
    -- Next of Kin
    next_of_kin_surname TEXT NOT NULL,
    next_of_kin_other_names TEXT NOT NULL,
    next_of_kin_address TEXT NOT NULL,
    next_of_kin_phone TEXT NOT NULL,
    next_of_kin_relationship TEXT NOT NULL,
    
    -- Bank Account Information
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    
    -- Digital Signature
    digital_signature TEXT NOT NULL,
    date DATE NOT NULL,
    
    -- Files
    passport_photo_url TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' NOT NULL,
    
    -- Payment Information
    payment_reference TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_amount DECIMAL(12,2),
    payment_date TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for customer_subscriptions
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all customer subscriptions" ON public.customer_subscriptions
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert customer subscriptions" ON public.customer_subscriptions
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update customer subscriptions" ON public.customer_subscriptions
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete customer subscriptions" ON public.customer_subscriptions
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Allow public to insert customer subscriptions (for form submissions)
CREATE POLICY "Public can insert customer subscriptions" ON public.customer_subscriptions
    FOR INSERT WITH CHECK (true);

-- Add RLS policies for consultant_subscriptions
ALTER TABLE public.consultant_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all consultant subscriptions" ON public.consultant_subscriptions
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert consultant subscriptions" ON public.consultant_subscriptions
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update consultant subscriptions" ON public.consultant_subscriptions
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete consultant subscriptions" ON public.consultant_subscriptions
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Allow public to insert consultant subscriptions (for form submissions)
CREATE POLICY "Public can insert consultant subscriptions" ON public.consultant_subscriptions
    FOR INSERT WITH CHECK (true);

-- Enable realtime for subscription tables
ALTER TABLE public.customer_subscriptions REPLICA IDENTITY FULL;
ALTER TABLE public.consultant_subscriptions REPLICA IDENTITY FULL;

-- Add to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultant_subscriptions;
