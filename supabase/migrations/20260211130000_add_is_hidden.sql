-- Add is_hidden column to events
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_hidden') THEN
        ALTER TABLE public.events ADD COLUMN is_hidden boolean DEFAULT false;
    END IF;
END $$;

-- Add is_hidden column to cities (communities)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cities' AND column_name = 'is_hidden') THEN
        ALTER TABLE public.cities ADD COLUMN is_hidden boolean DEFAULT false;
    END IF;
END $$;

-- Add is_hidden column to posts (blog)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'is_hidden') THEN
        ALTER TABLE public.posts ADD COLUMN is_hidden boolean DEFAULT false;
    END IF;
END $$;
