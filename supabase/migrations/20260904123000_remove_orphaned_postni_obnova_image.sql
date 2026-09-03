-- Remove the sole dead rich-text image reference left after the AKH image
-- cutover. The object is absent from both legacy Storage and the canonical R2
-- bucket; all other persisted AKH image references were verified as readable.

do $$
declare
  event_slug constant text := 'postniobnova2026';
  missing_url constant text := 'https://akh.img.festapp.net/images/uploads/1768758903818.jpg';
  missing_tag constant text := '<img class="rounded-lg border shadow-sm max-w-full h-auto my-4" src="' || missing_url || '">';
begin
  update public.events
  set content = replace(content, missing_tag, '')
  where slug = event_slug
    and content like '%' || missing_url || '%';

  if exists (
    select 1
    from public.events
    where content like '%' || missing_url || '%'
  ) then
    raise exception 'orphaned AKH image URL remains after cleanup';
  end if;
end
$$;
