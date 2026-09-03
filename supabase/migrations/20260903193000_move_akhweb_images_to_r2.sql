-- Move persisted image URLs only after all source objects are hash-verified in
-- R2 and the canonical public hostname is live. Object keys stay unchanged.

do $$
declare
  old_prefix constant text := 'https://lwfpdjxsdmkfyrzqbrlk.supabase.co/storage/v1/object/public/akhweb/';
  new_prefix constant text := 'https://akh.img.festapp.net/';
begin
  update public.content_blocks
  set content = replace(content::text, old_prefix, new_prefix)::jsonb
  where content::text like '%' || old_prefix || '%';

  update public.cities
  set image_url = replace(image_url, old_prefix, new_prefix)
  where image_url like '%' || old_prefix || '%';

  update public.events
  set image_url = replace(image_url, old_prefix, new_prefix)
  where image_url like '%' || old_prefix || '%';

  update public.events
  set content = replace(content, old_prefix, new_prefix)
  where content like '%' || old_prefix || '%';

  update public.posts
  set content = replace(content, old_prefix, new_prefix)
  where content like '%' || old_prefix || '%';

  update public.posts
  set image_url = replace(image_url, old_prefix, new_prefix)
  where image_url like '%' || old_prefix || '%';

  update public.council_members
  set image_url = replace(image_url, old_prefix, new_prefix)
  where image_url like '%' || old_prefix || '%';

  if exists (
    select 1 from public.content_blocks where content::text like '%' || old_prefix || '%'
    union all select 1 from public.cities where image_url like '%' || old_prefix || '%'
    union all select 1 from public.events where image_url like '%' || old_prefix || '%'
    union all select 1 from public.events where content like '%' || old_prefix || '%'
    union all select 1 from public.posts where content like '%' || old_prefix || '%'
    union all select 1 from public.posts where image_url like '%' || old_prefix || '%'
    union all select 1 from public.council_members where image_url like '%' || old_prefix || '%'
  ) then
    raise exception 'legacy AKH Storage URLs remain after migration';
  end if;
end
$$;
