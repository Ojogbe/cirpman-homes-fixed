-- Enable realtime for all tables
ALTER TABLE public.properties REPLICA IDENTITY FULL;
ALTER TABLE public.gallery REPLICA IDENTITY FULL;
ALTER TABLE public.progress_timeline REPLICA IDENTITY FULL;
ALTER TABLE public.site_visit_bookings REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.property_bookings REPLICA IDENTITY FULL;
ALTER TABLE public.installment_plans REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery;
ALTER PUBLICATION supabase_realtime ADD TABLE public.progress_timeline;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visit_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.installment_plans;

-- Add installment payment option to properties table
ALTER TABLE public.properties ADD COLUMN installment_available boolean DEFAULT false;

-- Update properties table to support better image/video handling
ALTER TABLE public.properties ADD COLUMN featured_image text;