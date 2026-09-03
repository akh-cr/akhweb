-- Browser-local blob URLs must never be persisted in rich-text content. Replace
-- the two remaining stale values with each event's canonical uploaded image.

do $$
begin
  update public.events
  set content = replace(
    content,
    'blob:https://akhcr.cz/5aee038a-c87e-43a0-a619-a36a7adef18e',
    'https://akh.img.festapp.net/images/uploads/e2299c7d-d931-4f2f-870a-024785bfa4c9.blob'
  )
  where slug = 'kinderalm-leto2026';

  update public.events
  set content = replace(
    content,
    'blob:https://akhcr.cz/4bbf6941-b30e-4146-8861-4e7a429041e2',
    'https://akh.img.festapp.net/images/uploads/fa602564-1210-4182-8701-527e333a68d0.blob'
  )
  where slug = 'spolecnedal2026';

  if exists (
    select 1 from public.events where content like '%src="blob:%'
    union all select 1 from public.events where description like '%src="blob:%'
    union all select 1 from public.cities where content like '%src="blob:%'
    union all select 1 from public.cities where description like '%src="blob:%'
    union all select 1 from public.posts where content like '%src="blob:%'
    union all select 1 from public.posts where excerpt like '%src="blob:%'
  ) then
    raise exception 'browser-local blob image URL remains in rich-text content';
  end if;
end
$$;
