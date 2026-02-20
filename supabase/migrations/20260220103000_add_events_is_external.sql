-- Mark events that are organized outside AKH ("cizi akce")
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'events'
          AND column_name = 'is_external'
    ) THEN
        ALTER TABLE public.events
            ADD COLUMN is_external boolean NOT NULL DEFAULT false;
    END IF;
END $$;
