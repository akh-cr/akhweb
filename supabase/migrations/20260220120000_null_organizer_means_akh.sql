-- Normalize data model: organizer_id NULL means AKH.
UPDATE public.events e
SET organizer_id = NULL,
    is_external = false
FROM public.event_organizers o
WHERE e.organizer_id = o.id
  AND o.is_akh = true;
