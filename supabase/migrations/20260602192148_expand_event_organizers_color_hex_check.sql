-- The event_organizers_color_hex_check constraint had drifted from the app's
-- color palette (lib/event-organizer-colors.ts -> ORGANIZER_COLOR_OPTIONS).
-- Picking a color the UI offers but the constraint omits (e.g. "Levandule"
-- #c4b5fd) made saving an organizer fail with:
--   new row for relation "event_organizers" violates check constraint
--   "event_organizers_color_hex_check"
-- Re-define the constraint so it permits every color the UI offers.
ALTER TABLE public.event_organizers
DROP CONSTRAINT IF EXISTS event_organizers_color_hex_check;

ALTER TABLE public.event_organizers
ADD CONSTRAINT event_organizers_color_hex_check
CHECK (color_hex IN (
  '#ffd166', -- AKH zlatá
  '#7dd3fc', -- Nebeská
  '#fbbf24', -- Jantarová
  '#34d399', -- Smaragdová
  '#fb7185', -- Růžová
  '#a78bfa', -- Fialová
  '#94a3b8', -- Břidlicová
  '#fb923c', -- Korálová
  '#2dd4bf', -- Teal
  '#f43f5e', -- Malinová
  '#c4b5fd', -- Levandule
  '#a3b18a'  -- Oliva
));
