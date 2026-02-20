-- Organizer catalog for events (allows reusable external organizers).
CREATE TABLE IF NOT EXISTS public.event_organizers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  is_akh boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_organizers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'event_organizers'
      AND policyname = 'Public read event organizers'
  ) THEN
    CREATE POLICY "Public read event organizers"
      ON public.event_organizers
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'event_organizers'
      AND policyname = 'Admins manage event organizers'
  ) THEN
    CREATE POLICY "Admins manage event organizers"
      ON public.event_organizers
      FOR ALL
      USING (public.is_admin_or_editor());
  END IF;
END $$;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS organizer_id uuid REFERENCES public.event_organizers(id);

CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);

-- Ensure canonical AKH organizer exists.
INSERT INTO public.event_organizers (name, is_akh)
VALUES ('AKH', true)
ON CONFLICT (name) DO UPDATE SET is_akh = EXCLUDED.is_akh;

-- Backfill existing AKH-organized events (legacy model: is_external = false).
UPDATE public.events e
SET organizer_id = o.id
FROM public.event_organizers o
WHERE o.name = 'AKH'
  AND e.organizer_id IS NULL
  AND COALESCE(e.is_external, false) = false;
