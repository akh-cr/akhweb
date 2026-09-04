-- Browser-local blob URLs expire with the editing tab and must never become
-- persisted image sources. Keep this invariant at the database boundary for
-- every rich-text owner, including clients that write cities directly.

alter table public.events
  add constraint events_rich_text_no_blob_images
  check (
    coalesce(description, '') !~* $pattern$src[[:space:]]*=[[:space:]]*["']blob:$pattern$
    and coalesce(content, '') !~* $pattern$src[[:space:]]*=[[:space:]]*["']blob:$pattern$
  );

alter table public.cities
  add constraint cities_rich_text_no_blob_images
  check (
    coalesce(description, '') !~* $pattern$src[[:space:]]*=[[:space:]]*["']blob:$pattern$
    and coalesce(content, '') !~* $pattern$src[[:space:]]*=[[:space:]]*["']blob:$pattern$
  );

alter table public.posts
  add constraint posts_rich_text_no_blob_images
  check (
    coalesce(excerpt, '') !~* $pattern$src[[:space:]]*=[[:space:]]*["']blob:$pattern$
    and coalesce(content, '') !~* $pattern$src[[:space:]]*=[[:space:]]*["']blob:$pattern$
  );
