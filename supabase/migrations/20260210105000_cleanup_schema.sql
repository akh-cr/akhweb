-- Drop unused newsletter table
DROP TABLE IF EXISTS public.newsletter;

-- Add metadata column to cities if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cities' AND column_name = 'metadata') THEN
        ALTER TABLE public.cities ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Migrate latitude/longitude to metadata if they exist
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Only proceed if latitude column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cities' AND column_name = 'latitude') THEN
        FOR r IN SELECT id, latitude, longitude, metadata FROM public.cities LOOP
            -- Construct new metadata
            -- Preserves existing metadata, adds/overwrites map.lat/lon
            UPDATE public.cities
            SET metadata = jsonb_set(
                jsonb_set(
                    COALESCE(metadata, '{}'::jsonb),
                    '{map}',
                    COALESCE(metadata->'map', '{}'::jsonb)
                ),
                '{map,lat}',
                to_jsonb(r.latitude)
            )
            WHERE id = r.id AND r.latitude IS NOT NULL;
            
            UPDATE public.cities
            SET metadata = jsonb_set(
                metadata,
                '{map,lon}',
                to_jsonb(r.longitude)
            )
            WHERE id = r.id AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL;
        END LOOP;
    END IF;
END $$;

-- Drop legacy columns from cities
ALTER TABLE public.cities DROP COLUMN IF EXISTS latitude;
ALTER TABLE public.cities DROP COLUMN IF EXISTS longitude;
ALTER TABLE public.cities DROP COLUMN IF EXISTS population;
ALTER TABLE public.cities DROP COLUMN IF EXISTS district;
ALTER TABLE public.cities DROP COLUMN IF EXISTS country_id;
ALTER TABLE public.cities DROP COLUMN IF EXISTS wiki_url;
ALTER TABLE public.cities DROP COLUMN IF EXISTS website;
ALTER TABLE public.cities DROP COLUMN IF EXISTS map_url;

-- Ensure content column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cities' AND column_name = 'content') THEN
        ALTER TABLE public.cities ADD COLUMN content text;
    END IF;
END $$;
