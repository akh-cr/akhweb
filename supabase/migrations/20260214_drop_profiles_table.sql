-- Migration: Drop unused profiles table
-- Date: 2026-02-14
-- Reason: profiles table is unused (0 records, no code references)
-- Note: user_roles table is still maintained for RBAC

-- Drop RLS policies first
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Drop the profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;
