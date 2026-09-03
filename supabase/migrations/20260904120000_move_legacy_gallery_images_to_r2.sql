-- Complete the AKH image cutover for gallery arrays that were omitted from the
-- original scalar/JSON/text URL migration. Object keys are unchanged and were
-- verified in the dedicated R2 bucket before this migration was applied.

do $$
declare
  old_prefix constant text := 'https://lwfpdjxsdmkfyrzqbrlk.supabase.co/storage/v1/object/public/akhweb/';
  new_prefix constant text := 'https://akh.img.festapp.net/';
begin
  update public.events as event
  set gallery_images = (
    select array_agg(replace(image_url, old_prefix, new_prefix) order by position) as urls
    from unnest(event.gallery_images) with ordinality as image(image_url, position)
  )
  where event.gallery_images::text like '%' || old_prefix || '%';

  update public.cities as city
  set gallery_images = (
    select array_agg(replace(image_url, old_prefix, new_prefix) order by position) as urls
    from unnest(city.gallery_images) with ordinality as image(image_url, position)
  )
  where city.gallery_images::text like '%' || old_prefix || '%';

  if exists (
    select 1 from public.content_blocks where content::text like '%' || old_prefix || '%'
    union all select 1 from public.cities where image_url like '%' || old_prefix || '%'
    union all select 1 from public.cities where content like '%' || old_prefix || '%'
    union all select 1 from public.cities where gallery_images::text like '%' || old_prefix || '%'
    union all select 1 from public.events where image_url like '%' || old_prefix || '%'
    union all select 1 from public.events where content like '%' || old_prefix || '%'
    union all select 1 from public.events where gallery_images::text like '%' || old_prefix || '%'
    union all select 1 from public.posts where content like '%' || old_prefix || '%'
    union all select 1 from public.posts where image_url like '%' || old_prefix || '%'
    union all select 1 from public.council_members where image_url like '%' || old_prefix || '%'
  ) then
    raise exception 'legacy AKH Storage URLs remain after gallery migration';
  end if;
end
$$;
