-- Secure RPCs by explicitly managing permissions
-- Ensuring administrative functions are not executable by the public (anon) role
-- even though they have internal role checks.

-- 1. get_users_with_roles
-- Verify the signature matches: public.get_users_with_roles()
REVOKE EXECUTE ON FUNCTION public.get_users_with_roles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_users_with_roles() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO service_role;

-- 2. get_admin_news_feed
-- Verify signature: public.get_admin_news_feed(INTEGER, INTEGER)
REVOKE EXECUTE ON FUNCTION public.get_admin_news_feed(INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_news_feed(INTEGER, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_news_feed(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_news_feed(INTEGER, INTEGER) TO service_role;

-- 3. get_news_feed is public, so we explicit grant to ensure no regression
GRANT EXECUTE ON FUNCTION public.get_news_feed(INTEGER, INTEGER, BOOLEAN) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_news_feed(INTEGER, INTEGER, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION public.get_news_feed(INTEGER, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_news_feed(INTEGER, INTEGER, BOOLEAN) TO service_role;
