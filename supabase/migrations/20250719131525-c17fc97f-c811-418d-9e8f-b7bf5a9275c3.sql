
-- Create enum types for various status fields
CREATE TYPE property_status AS ENUM ('Available', 'Reserved', 'Sold');
CREATE TYPE property_progress AS ENUM ('Planned', 'In Progress', 'Completed');
CREATE TYPE user_role AS ENUM ('client', 'admin');
CREATE TYPE gallery_category AS ENUM ('Drone Shots', 'Allocation Events', 'Construction', 'Events');
CREATE TYPE payment_status AS ENUM ('On Track', 'Overdue', 'Completed');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  size_min INTEGER NOT NULL,
  size_max INTEGER NOT NULL,
  price_min NUMERIC NOT NULL,
  price_max NUMERIC NOT NULL,
  status property_status NOT NULL DEFAULT 'Available',
  progress property_progress NOT NULL DEFAULT 'Planned',
  images TEXT[],
  videos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery table for categorized images
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  category gallery_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create progress timeline table
CREATE TABLE public.progress_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leadership team table
CREATE TABLE public.leadership_team (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create site visit bookings table
CREATE TABLE public.site_visit_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  message TEXT,
  follow_up_status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property bookings table for installment tracking
CREATE TABLE public.property_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  property_id UUID NOT NULL REFERENCES public.properties,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create installment plans table
CREATE TABLE public.installment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.property_bookings,
  total_amount NUMERIC NOT NULL,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  next_payment_date DATE,
  next_payment_amount NUMERIC,
  status payment_status NOT NULL DEFAULT 'On Track',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment history table
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  installment_plan_id UUID NOT NULL REFERENCES public.installment_plans,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visit_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for properties (public read, admin write)
CREATE POLICY "Anyone can view properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Admins can manage properties" ON public.properties FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for gallery (public read, admin write)
CREATE POLICY "Anyone can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for progress timeline (public read, admin write)
CREATE POLICY "Anyone can view progress timeline" ON public.progress_timeline FOR SELECT USING (true);
CREATE POLICY "Admins can manage progress timeline" ON public.progress_timeline FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for leadership team (public read, admin write)
CREATE POLICY "Anyone can view leadership team" ON public.leadership_team FOR SELECT USING (true);
CREATE POLICY "Admins can manage leadership team" ON public.leadership_team FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for site visit bookings
CREATE POLICY "Users can create bookings" ON public.site_visit_bookings FOR INSERT WITH CHECK (
  user_id = auth.uid() OR user_id IS NULL
);
CREATE POLICY "Users can view own bookings" ON public.site_visit_bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all bookings" ON public.site_visit_bookings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Admins can update bookings" ON public.site_visit_bookings FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for property bookings
CREATE POLICY "Users can view own property bookings" ON public.property_bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all property bookings" ON public.property_bookings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for installment plans
CREATE POLICY "Users can view own installment plans" ON public.installment_plans FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.property_bookings pb 
    WHERE pb.id = installment_plans.booking_id AND pb.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage installment plans" ON public.installment_plans FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for payment history
CREATE POLICY "Users can view own payment history" ON public.payment_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.installment_plans ip
    JOIN public.property_bookings pb ON pb.id = ip.booking_id
    WHERE ip.id = payment_history.installment_plan_id AND pb.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage payment history" ON public.payment_history FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    NEW.raw_user_meta_data ->> 'phone',
    'client'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create storage bucket for real estate uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('real-estate-uploads', 'real-estate-uploads', true);

-- Create storage policies
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'real-estate-uploads');
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'real-estate-uploads' AND auth.role() = 'authenticated'
);
CREATE POLICY "Admins can manage all files" ON storage.objects FOR ALL USING (
  bucket_id = 'real-estate-uploads' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
