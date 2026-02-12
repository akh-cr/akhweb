-- RPC to get users with roles (Security Definer to access auth.users)
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
    id uuid,
    email text,
    role text,
    created_at timestamptz,
    email_confirmed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if requesting user is admin
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
        au.email_confirmed_at
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    ORDER BY au.created_at DESC;
END;
$$;
