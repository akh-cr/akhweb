-- Authenticated-only authorization oracle for the canonical image Worker.

create or replace function public.get_can_manage_images()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role in ('admin', 'editor', 'organizer')
  );
$$;

revoke all on function public.get_can_manage_images() from public;
revoke all on function public.get_can_manage_images() from anon;
grant execute on function public.get_can_manage_images() to authenticated;
