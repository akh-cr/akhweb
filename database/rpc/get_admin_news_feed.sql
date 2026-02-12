-- RPC for Admin Feed
-- Returns a superset of get_news_feed with all columns needed for admin, respecting admin roles

CREATE OR REPLACE FUNCTION get_admin_news_feed(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id TEXT,
  type TEXT,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  content JSONB,
  published_at TIMESTAMPTZ,
  image_url TEXT,
  author_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_hidden BOOLEAN,
  city_name TEXT,
  location TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Use security definer to bypass RLS if needed, but we check role inside
SET search_path = public
AS $$
BEGIN
    -- Check if requesting user is admin or editor
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

  RETURN QUERY
  WITH combined_feed AS (
    -- Blog Posts
    SELECT
      p.id::TEXT,
      'post'::TEXT as type,
      p.title,
      p.slug,
      p.excerpt,
      NULL::JSONB as content, -- Optimization: don't load content in list
      p.published_at,
      p.image_url,
      p.author_id,
      p.created_at,
      p.created_at as updated_at, -- Fallback since updated_at missing
      p.is_hidden,
      NULL::TEXT as city_name,
      NULL::TEXT as location
    FROM posts p

    UNION ALL

    -- Events
    SELECT
      e.id::TEXT,
      'event'::TEXT as type,
      e.title,
      e.slug,
      e.description as excerpt,
      NULL::JSONB as content,
      e.news_publish_date as published_at,
      e.image_url,
      NULL::UUID as author_id,
      e.created_at,
      e.created_at as updated_at, -- Fallback
      e.is_hidden,
      c.name as city_name,
      e.location
    FROM events e
    LEFT JOIN cities c ON e.city_id = c.id
    WHERE e.news_publish_date IS NOT NULL

    UNION ALL

    -- Communities (Cities)
    SELECT
      c.id,
      'community'::TEXT as type,
      c.name as title,
      c.slug,
      c.description as excerpt,
      NULL::JSONB as content,
      c.news_publish_date as published_at,
      c.image_url,
      NULL::UUID as author_id,
      c.news_publish_date as created_at, -- Fallback: cities have no created_at
      c.news_publish_date as updated_at, -- Fallback
      c.is_hidden,
      c.name as city_name,
      NULL::TEXT as location
    FROM cities c
    WHERE c.news_publish_date IS NOT NULL
  )
  SELECT
    cf.id,
    cf.type,
    cf.title,
    cf.slug,
    cf.excerpt,
    cf.content,
    cf.published_at,
    cf.image_url,
    cf.author_id,
    cf.created_at,
    cf.updated_at,
    cf.is_hidden,
    cf.city_name,
    cf.location,
    COUNT(*) OVER()::BIGINT as total_count
  FROM combined_feed cf
  ORDER BY 
    cf.published_at DESC NULLS FIRST,
    cf.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
