-- Final cleanup: derive AKH/external from organizer_id NULLability.
ALTER TABLE public.events
DROP COLUMN IF EXISTS is_external;

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
  organizer_name TEXT,
  city_name TEXT,
  location TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH combined_feed AS (
    SELECT
      p.id::TEXT,
      'post'::TEXT as type,
      p.title,
      p.slug,
      p.excerpt,
      p.published_at,
      p.image_url,
      p.is_hidden,
      NULL::TEXT as organizer_name,
      NULL::TEXT as city_name,
      NULL::TEXT as location
    FROM posts p
    WHERE
      CASE
        WHEN p_include_hidden THEN TRUE
        ELSE (p.is_hidden = FALSE AND p.published_at IS NOT NULL AND p.published_at <= NOW())
      END

    UNION ALL

    SELECT
      e.id::TEXT,
      'event'::TEXT as type,
      e.title,
      e.slug,
      e.description as excerpt,
      e.news_publish_date as published_at,
      e.image_url,
      e.is_hidden,
      o.name as organizer_name,
      c.name as city_name,
      e.location
    FROM events e
    LEFT JOIN cities c ON e.city_id = c.id
    LEFT JOIN event_organizers o ON e.organizer_id = o.id
    WHERE
      CASE
        WHEN p_include_hidden THEN TRUE
        ELSE (e.is_hidden = FALSE AND e.news_publish_date IS NOT NULL AND e.news_publish_date <= NOW())
      END

    UNION ALL

    SELECT
      c.id,
      'community'::TEXT as type,
      c.name as title,
      c.slug,
      c.description as excerpt,
      c.news_publish_date as published_at,
      c.image_url,
      c.is_hidden,
      NULL::TEXT as organizer_name,
      c.name as city_name,
      NULL::TEXT as location
    FROM cities c
    WHERE
      CASE
        WHEN p_include_hidden THEN TRUE
        ELSE (c.is_hidden = FALSE AND c.news_publish_date IS NOT NULL)
      END
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
    cf.organizer_name,
    cf.city_name,
    cf.location,
    COUNT(*) OVER()::BIGINT as total_count
  FROM combined_feed cf
  ORDER BY cf.published_at DESC NULLS FIRST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
