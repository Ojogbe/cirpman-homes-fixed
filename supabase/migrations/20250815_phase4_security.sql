-- Phase 4: Security & Polish
-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
	ip TEXT NOT NULL,
	user_agent TEXT,
	action TEXT NOT NULL,
	count INTEGER NOT NULL DEFAULT 1,
	window_start TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action ON public.rate_limits (ip, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits (window_start);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = timezone('utc'::text, now());
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to content tables if they exist
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='blog_posts') THEN
		CREATE TRIGGER blog_posts_set_updated_at BEFORE UPDATE ON public.blog_posts
		FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='testimonials') THEN
		CREATE TRIGGER testimonials_set_updated_at BEFORE UPDATE ON public.testimonials
		FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='faq') THEN
		CREATE TRIGGER faq_set_updated_at BEFORE UPDATE ON public.faq
		FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='feedback') THEN
		CREATE TRIGGER feedback_set_updated_at BEFORE UPDATE ON public.feedback
		FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='newsletter_subscriptions') THEN
		CREATE TRIGGER newsletter_subscriptions_set_updated_at BEFORE UPDATE ON public.newsletter_subscriptions
		FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='customer_subscriptions') THEN
		CREATE TRIGGER customer_subscriptions_set_updated_at BEFORE UPDATE ON public.customer_subscriptions
		FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='consultant_subscriptions') THEN
		CREATE TRIGGER consultant_subscriptions_set_updated_at BEFORE UPDATE ON public.consultant_subscriptions
		FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
	END IF;
END $$;
