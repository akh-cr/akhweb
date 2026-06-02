-- Organization-scoped users ("pozvánky od jiných").
-- Adds the 'organizer' role, links each organizer-user to exactly one
-- event_organizers row, and enforces per-organization access to events via RLS.

-- 1. Extend the user_roles role enumeration with 'organizer'.
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('admin', 'editor', 'user', 'organizer'));

-- 2. Link organizer-users to their organization.
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS organizer_id uuid REFERENCES public.event_organizers(id) ON DELETE CASCADE;

-- organizer_id is present exactly when (and only when) the role is 'organizer'.
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_organizer_scope_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_organizer_scope_check
  CHECK ((role = 'organizer') = (organizer_id IS NOT NULL));

CREATE INDEX IF NOT EXISTS idx_user_roles_organizer_id ON public.user_roles(organizer_id);

-- 3. Helper: the organization the current user manages (NULL for non-organizers).
CREATE OR REPLACE FUNCTION public.current_organizer_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organizer_id
  FROM public.user_roles
  WHERE user_id = auth.uid()
    AND role = 'organizer'
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.current_organizer_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_organizer_id() TO authenticated;

-- 4. RLS: organizers may manage ONLY their own organization's events.
--    Public read + admin/editor manage policies remain unchanged; permissive
--    policies are OR-combined, so this only widens access for organizer rows.
DROP POLICY IF EXISTS "Organizers manage own events" ON public.events;
CREATE POLICY "Organizers manage own events" ON public.events
  FOR ALL
  USING (organizer_id IS NOT NULL AND organizer_id = public.current_organizer_id())
  WITH CHECK (organizer_id IS NOT NULL AND organizer_id = public.current_organizer_id());

-- 5. Expose the organization on the admin "users with roles" RPC.
DROP FUNCTION IF EXISTS public.get_users_with_roles();

CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
    id uuid,
    email text,
    role text,
    created_at timestamptz,
    email_confirmed_at timestamptz,
    organizer_id uuid,
    organizer_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only admins may list users.
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT
        au.id,
        au.email::text,
        COALESCE(ur.role, 'user') as role,
        au.created_at,
        au.email_confirmed_at,
        ur.organizer_id,
        o.name as organizer_name
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    LEFT JOIN public.event_organizers o ON ur.organizer_id = o.id
    ORDER BY au.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_users_with_roles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_users_with_roles() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO service_role;
