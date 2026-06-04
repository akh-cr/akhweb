-- Tidy content RLS to one clean, canonical staff-gated set (issue #09, corrected).
--
-- Reality check vs prod (2026-06-04): content_blocks/posts writes were ALREADY gated to
-- staff via is_admin_or_editor(). There was NO "any authenticated can write" hole in prod
-- (that existed only in a diverged local schema.sql). So this does NOT change the security
-- posture; it tidies to one clean set:
--   * canonical role helpers mirroring lib/auth/roles.ts: is_staff(), is_event_manager()
--     (is_admin() already exists); legacy is_admin_or_editor() now delegates to is_staff()
--     so cities/events/event_organizers policies share one source of truth.
--   * collapses posts' two duplicate ALL policies into one.
--   * content_blocks/posts write policies renamed to the canonical "Staff can manage ..." and
--     point at is_staff(). Public read policies are left untouched.
--
-- Idempotent-friendly: helpers use CREATE OR REPLACE; policies are dropped with IF EXISTS.

-- 1. Canonical role helpers (mirror lib/auth/roles.ts). SECURITY DEFINER + fixed search_path.
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin','editor')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_event_manager()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin','editor','organizer')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_event_manager() TO authenticated, anon, service_role;

-- Legacy alias kept for cities/events/event_organizers policies — now one source of truth.
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_staff();
$$;

-- 2. posts — collapse the two duplicate ALL policies into one canonical staff policy.
DROP POLICY IF EXISTS "Admins manage posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can manage posts" ON public.posts;
DROP POLICY IF EXISTS "Staff can manage posts" ON public.posts;
CREATE POLICY "Staff can manage posts" ON public.posts
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- 3. content_blocks — single canonical staff write policy (public read untouched).
DROP POLICY IF EXISTS "Editors can manage content blocks" ON public.content_blocks;
DROP POLICY IF EXISTS "Staff can manage content blocks" ON public.content_blocks;
CREATE POLICY "Staff can manage content blocks" ON public.content_blocks
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
