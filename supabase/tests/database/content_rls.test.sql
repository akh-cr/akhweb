-- Content-table RLS guarantees (issue #09 — defense in depth).
--
-- The app guards (#01/#02) are only the SECOND line of defense. Postgres itself
-- must reject content writes from non-staff. This test inspects pg_policies and
-- fails if any WRITE policy on content_blocks / posts is permissive — i.e. a
-- `USING (true)` / `WITH CHECK (true)` that lets any authenticated user mutate.
--
-- NOTE: prod was already staff-gated (via is_admin_or_editor); 20260604130105 tidied the
--   policies to the canonical public.is_staff() and collapsed posts' duplicate. This test
--   asserts the end state: every content_blocks/posts write policy is role-based (references
--   a role helper / user_roles), none is permissive `USING(true)`, and public read stays open.
--   It RAISES if a permissive or non-role-based write policy ever reappears.
--
-- Run with: psql "$DATABASE_URL" -f supabase/tests/database/content_rls.test.sql
-- (read-only: the whole test is wrapped in BEGIN/ROLLBACK).

BEGIN;

-- A write policy is "permissive" when its USING or WITH CHECK qualifier is the
-- literal `true` (after Postgres normalizes it) with no role predicate. A write
-- policy is "role-based" when its qualifier references a role helper or the
-- user_roles table. We check the parsed qual / with_check text in pg_policies.

DO $$
DECLARE
  bad RECORD;
  problems text := '';
  n_write integer;
BEGIN
  FOR bad IN
    SELECT tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('content_blocks', 'posts')
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  LOOP
    -- Permissive if the present qualifier(s) are literally `true`.
    IF (bad.qual IS NOT NULL AND btrim(lower(bad.qual)) = 'true')
       OR (bad.with_check IS NOT NULL AND btrim(lower(bad.with_check)) = 'true')
    THEN
      problems := problems || format(
        E'\n  PERMISSIVE: %I."%s" (%s) using=%L check=%L',
        bad.tablename, bad.policyname, bad.cmd, bad.qual, bad.with_check);
      CONTINUE;
    END IF;

    -- Otherwise it must reference a role predicate somewhere.
    IF NOT (
      COALESCE(bad.qual, '') ~* '(is_staff|is_admin|is_event_manager|is_admin_or_editor|user_roles)'
      OR COALESCE(bad.with_check, '') ~* '(is_staff|is_admin|is_event_manager|is_admin_or_editor|user_roles)'
    ) THEN
      problems := problems || format(
        E'\n  NOT ROLE-BASED: %I."%s" (%s) using=%L check=%L',
        bad.tablename, bad.policyname, bad.cmd, bad.qual, bad.with_check);
    END IF;
  END LOOP;

  IF problems <> '' THEN
    RAISE EXCEPTION 'content_blocks/posts have non-staff-scoped write policies:%', problems;
  END IF;

  -- Each content table must actually have at least one write policy.
  FOR bad IN SELECT unnest(ARRAY['content_blocks', 'posts']) AS t LOOP
    SELECT count(*) INTO n_write
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = bad.t
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL');
    IF n_write = 0 THEN
      RAISE EXCEPTION 'table % has no write policy at all', bad.t;
    END IF;
  END LOOP;

  -- Public read must remain open (unchanged by the tightening migration).
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'content_blocks'
      AND cmd = 'SELECT' AND btrim(lower(qual)) = 'true'
  ) THEN
    RAISE EXCEPTION 'content_blocks lost its public read (SELECT USING true) policy';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'posts'
      AND cmd = 'SELECT' AND btrim(lower(qual)) = 'true'
  ) THEN
    RAISE EXCEPTION 'posts lost its public read (SELECT USING true) policy';
  END IF;

  RAISE NOTICE 'OK: content_blocks/posts writes are staff-scoped and reads stay public';
END $$;

ROLLBACK;
