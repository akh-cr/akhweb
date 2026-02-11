-- Migration to add unique constraint to user_roles table
-- First, remove duplicates keeping the most recent one (if created_at exists) or arbitrary one
DELETE FROM public.user_roles a USING public.user_roles b
WHERE a.id < b.id AND a.user_id = b.user_id;

-- Now add the constraint
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
