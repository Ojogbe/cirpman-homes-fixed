-- Add content management tables for Phase 3 features

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image_url TEXT,
    author_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    meta_description TEXT,
    view_count INTEGER DEFAULT 0
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    client_name TEXT NOT NULL,
    client_title TEXT,
    client_company TEXT,
    testimonial_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    client_photo_url TEXT,
    property_id UUID REFERENCES public.properties(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Create faq table
CREATE TABLE IF NOT EXISTS public.faq (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id)
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'resolved')),
    user_id UUID REFERENCES auth.users(id),
    property_id UUID REFERENCES public.properties(id),
    replied_by UUID REFERENCES auth.users(id),
    replied_at TIMESTAMP WITH TIME ZONE,
    reply_message TEXT
);

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    source TEXT DEFAULT 'contact_form',
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id)
);

-- Add RLS policies for blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published blog posts" ON public.blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Add RLS policies for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved testimonials" ON public.testimonials
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can manage all testimonials" ON public.testimonials
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Add RLS policies for faq
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active FAQ" ON public.faq
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all FAQ" ON public.faq
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Add RLS policies for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback" ON public.feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON public.feedback
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can insert feedback" ON public.feedback
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update feedback" ON public.feedback
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Add RLS policies for newsletter_subscriptions
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all newsletter subscriptions" ON public.newsletter_subscriptions
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can insert newsletter subscriptions" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own newsletter subscription" ON public.newsletter_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for content management tables
ALTER TABLE public.blog_posts REPLICA IDENTITY FULL;
ALTER TABLE public.testimonials REPLICA IDENTITY FULL;
ALTER TABLE public.faq REPLICA IDENTITY FULL;
ALTER TABLE public.feedback REPLICA IDENTITY FULL;
ALTER TABLE public.newsletter_subscriptions REPLICA IDENTITY FULL;

-- Add to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;
ALTER PUBLICATION supabase_realtime ADD TABLE public.faq;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.newsletter_subscriptions;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(featured);
CREATE INDEX IF NOT EXISTS idx_faq_category ON public.faq(category);
CREATE INDEX IF NOT EXISTS idx_faq_order ON public.faq(order_index);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON public.newsletter_subscriptions(status);
