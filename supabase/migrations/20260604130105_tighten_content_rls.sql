-- Tighten RLS on the content tables (defense in depth — issue #09).
--
-- The app-layer guards (#01/#02) are only the SECOND line of defense. The RLS
-- policies that shipped for `content_blocks` and `posts` are permissive:
-- `FOR UPDATE/INSERT/ALL TO authenticated USING (true) WITH CHECK (true)`, which
-- lets ANY authenticated user (e.g. an organizer or a plain `user`) mutate site
-- content. Postgres itself must enforce the same role tiers the app assumes.
--
-- Tiers mirror lib/auth/roles.ts (and supabase/functions/_shared/roles.ts):
--   is_admin(uid)         -> role = 'admin'                         (admin-only)
--   is_staff(uid)         -> role IN ('admin','editor')             (content)
--   is_event_manager(uid) -> role IN ('admin','editor','organizer') (events)
--
-- This migration scopes ONLY the write (insert/update/delete) policies. Public
-- read access is left exactly as it is today. Tables whose writes are already
-- role-based (events, event_organizers, cities, pages, user_roles) are left
-- untouched here.
--
-- Idempotent-friendly: helpers use CREATE OR REPLACE; policies are dropped with
-- IF EXISTS before being recreated.

-- ---------------------------------------------------------------------------
-- 1. Role helper functions (SQL mirror of lib/auth/roles.ts).
--    SECURITY DEFINER + a fixed search_path so they can read user_roles
--    regardless of the caller's own RLS view of that table.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = uid
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = uid
      AND role IN ('admin', 'editor')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_event_manager(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = uid
      AND role IN ('admin', 'editor', 'organizer')
  );
$$;

-- These predicates are safe to evaluate from any role context (they only read
-- the role table), so expose them to the relevant DB roles used by RLS.
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_event_manager(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_event_manager(uuid) TO authenticated, anon, service_role;

-- ---------------------------------------------------------------------------
-- 2. content_blocks — writes are STAFF only (admin/editor). Public read stays.
--    Replace the permissive update/insert policies and add an explicit delete.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can update content blocks" ON public.content_blocks;
DROP POLICY IF EXISTS "Admins can insert content blocks" ON public.content_blocks;
DROP POLICY IF EXISTS "Staff can update content blocks" ON public.content_blocks;
DROP POLICY IF EXISTS "Staff can insert content blocks" ON public.content_blocks;
DROP POLICY IF EXISTS "Staff can delete content blocks" ON public.content_blocks;

CREATE POLICY "Staff can insert content blocks"
  ON public.content_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update content blocks"
  ON public.content_blocks
  FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can delete content blocks"
  ON public.content_blocks
  FOR DELETE
  TO authenticated
  USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- 3. posts — writes are STAFF only (admin/editor). Public read stays.
--    Replace the single permissive FOR ALL policy.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can manage posts" ON public.posts;
DROP POLICY IF EXISTS "Staff can manage posts" ON public.posts;

CREATE POLICY "Staff can manage posts"
  ON public.posts
  FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());
