-- Create content_blocks table
CREATE TABLE IF NOT EXISTS public.content_blocks (
    id text PRIMARY KEY,
    type text NOT NULL, -- 'text', 'gallery', 'video', etc.
    content jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for content_blocks
-- Public can read
CREATE POLICY "Public can view content blocks" 
ON public.content_blocks FOR SELECT 
USING (true);

-- Authenticated users (admin) can update
CREATE POLICY "Admins can update content blocks" 
ON public.content_blocks FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Authenticated users (admin) can insert (for initialization)
CREATE POLICY "Admins can insert content blocks" 
ON public.content_blocks FOR INSERT 
TO authenticated 
WITH CHECK (true);


-- Create storage bucket for content if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'content' bucket
-- Public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'content' );

-- Authenticated upload access
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'content' );

-- Authenticated update access
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'content' );

-- Authenticated delete access
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'content' );

-- Insert initial placeholder data for homepage
INSERT INTO public.content_blocks (id, type, content)
VALUES 
    ('home.gallery', 'gallery', '{"images": []}'::jsonb),
    ('home.video', 'video', '{"videoId": "Oz9jz9g3b7U", "title": "O nás", "description": "Podívejte se na krátké představení Absolventského křesťanského hnutí a zjistěte, kdo jsme a co děláme."}'::jsonb),
    ('home.about', 'text_image', '{"title": "Proč absolventi?", "text": "Studentský život mají již za sebou, ale do rodinných společenství ještě nezapadají. Na skupinu mladých pracujících, kteří ještě nemají vlastní rodiny, se nejenom v církvi často zapomíná. AKH ČR si klade za cíl vyplnit tuto mezeru v pastorační péči, kterou mnozí absolventi cítí během hledání svého místa ve světě.", "items": ["Spolupracovat a sdílet zkušenosti napříč regiony", "Poskytnout vzájemnou podporu a sdílení", "Zajišťovat podporu pro formování absolventských společenství v jednotlivých městech a regionech"], "ctaText": "Více o naší vizi", "ctaLink": "/o-nas"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
