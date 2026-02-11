-- Drop existing function to allow return type change
DROP FUNCTION IF EXISTS get_news_feed(INTEGER, INTEGER, BOOLEAN);

CREATE OR REPLACE FUNCTION get_news_feed(
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0,
  p_include_hidden BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id TEXT,
  type TEXT,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  published_at TIMESTAMPTZ,
  image_url TEXT,
  is_hidden BOOLEAN,
  city_name TEXT,
  location TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH combined_feed AS (
    -- Blog Posts
    SELECT
      p.id::TEXT,
      'post'::TEXT as type,
      p.title,
      p.slug,
      p.excerpt,
      p.published_at,
      p.image_url,
      p.is_hidden,
      NULL::TEXT as city_name,
      NULL::TEXT as location
    FROM posts p
    WHERE (p_include_hidden OR p.is_hidden = FALSE)
      AND p.published_at IS NOT NULL
      AND p.published_at <= NOW()

    UNION ALL

    -- Promoted Events
    SELECT
      e.id::TEXT,
      'event'::TEXT as type,
      e.title,
      e.slug,
      e.description as excerpt,
      e.news_publish_date as published_at,
      e.image_url,
      e.is_hidden,
      c.name as city_name,
      e.location
    FROM events e
    LEFT JOIN cities c ON e.city_id = c.id
    WHERE (p_include_hidden OR e.is_hidden = FALSE)
      AND e.news_publish_date IS NOT NULL
      AND e.news_publish_date <= NOW()

    UNION ALL

    -- Promoted Communities (Cities)
    SELECT
      c.id,
      'community'::TEXT as type,
      c.name as title,
      c.slug,
      c.description as excerpt,
      c.news_publish_date as published_at,
      c.image_url,
      c.is_hidden,
      c.name as city_name,
      NULL::TEXT as location
    FROM cities c
    WHERE (p_include_hidden OR c.is_hidden = FALSE)
      AND c.news_publish_date IS NOT NULL
  )
  SELECT
    cf.id,
    cf.type,
    cf.title,
    cf.slug,
    cf.excerpt,
    cf.published_at,
    cf.image_url,
    cf.is_hidden,
    cf.city_name,
    cf.location,
    COUNT(*) OVER()::BIGINT as total_count
  FROM combined_feed cf
  ORDER BY cf.published_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
