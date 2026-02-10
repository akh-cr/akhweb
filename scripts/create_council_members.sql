-- Create council_members table
CREATE TABLE IF NOT EXISTS public.council_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL,
    bio text,
    image_url text,
    active boolean DEFAULT true,
    priority integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.council_members ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Allow public read access
CREATE POLICY "Public read access"
ON public.council_members
FOR SELECT
USING (true);

-- Allow admin write access
-- Using the same pattern as likely used elsewhere or strictly checking user_roles
CREATE POLICY "Admin full access"
ON public.council_members
FOR ALL
USING (
    exists (
        select 1 from public.user_roles 
        where user_roles.user_id = auth.uid() 
        and user_roles.role = 'admin'
    )
);

-- Seed initial data if table is empty
INSERT INTO public.council_members (name, role, bio, image_url, priority)
SELECT 'Vojtěch Kaska', 'Předseda', 'Hlavní koordinátor činnosti AKH. Zodpovídá za vedení spolku a komunikaci s partnery.', '', 1
WHERE NOT EXISTS (SELECT 1 FROM public.council_members);

INSERT INTO public.council_members (name, role, bio, image_url, priority)
SELECT 'Jana Capůrková', 'Předsedkyně', 'Zastupuje předsedu a koordinuje práci v regionech.', '', 2
WHERE NOT EXISTS (SELECT 1 FROM public.council_members WHERE name = 'Jana Capůrková');

INSERT INTO public.council_members (name, role, bio, image_url, priority)
SELECT 'Marie Svobodová', 'Hospodář', 'Stará se o finance, granty a členské příspěvky.', '', 3
WHERE NOT EXISTS (SELECT 1 FROM public.council_members WHERE name = 'Marie Svobodová');

INSERT INTO public.council_members (name, role, bio, image_url, priority)
SELECT 'Petr Dvořák', 'Člen rady (PR)', 'Spravuje sociální sítě, web a komunikaci s veřejností.', '', 4
WHERE NOT EXISTS (SELECT 1 FROM public.council_members WHERE name = 'Petr Dvořák');

INSERT INTO public.council_members (name, role, bio, image_url, priority)
SELECT 'Anna Černá', 'Člen rady (Akce)', 'Pomáhá s organizací celostátních setkání a Velehradu.', '', 5
WHERE NOT EXISTS (SELECT 1 FROM public.council_members WHERE name = 'Anna Černá');
