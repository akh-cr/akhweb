-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'editor', 'user')),
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own role"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
    ON public.user_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update roles"
    ON public.user_roles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete roles"
    ON public.user_roles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create RPC to get users with roles (Security Definer to access auth.users)
DROP FUNCTION IF EXISTS public.get_users_with_roles();

CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
    id uuid,
    email text,
    role text,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
        au.created_at
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    ORDER BY au.created_at DESC;
END;
$$;
