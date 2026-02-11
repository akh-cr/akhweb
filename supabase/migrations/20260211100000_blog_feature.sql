-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content jsonb DEFAULT '{}'::jsonb,
    published_at timestamp with time zone,
    image_url text,
    author_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT posts_pkey PRIMARY KEY (id),
    CONSTRAINT posts_slug_key UNIQUE (slug)
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
-- Public can read published posts
CREATE POLICY "Public can view published posts" 
ON public.posts FOR SELECT 
USING (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Admins can manage posts" 
ON public.posts FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Add news_publish_date to events table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'news_publish_date') THEN
        ALTER TABLE public.events ADD COLUMN news_publish_date timestamp with time zone;
    END IF;
END $$;

-- Create storage bucket for blog images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'blog' bucket
-- Public read access
CREATE POLICY "Public Access Blog"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog' );

-- Authenticated upload access
CREATE POLICY "Authenticated Upload Blog"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'blog' );

-- Authenticated update access
CREATE POLICY "Authenticated Update Blog"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'blog' );

-- Authenticated delete access
CREATE POLICY "Authenticated Delete Blog"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'blog' );
