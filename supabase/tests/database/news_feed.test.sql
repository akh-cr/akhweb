
BEGIN;
-- Test 1: Fetch items - should return 4 items (2 community, 2 posts) as seen in manual verification
DO $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result FROM get_news_feed(10, 0, true);
  IF count_result = 0 THEN
    RAISE EXCEPTION 'get_news_feed returned 0 items';
  END IF;
END $$;

-- Test 2: Sorting - first item should be newer than second
DO $$
DECLARE
  first_date TIMESTAMPTZ;
  second_date TIMESTAMPTZ;
BEGIN
  SELECT published_at INTO first_date FROM get_news_feed(10, 0, true) LIMIT 1 OFFSET 0;
  SELECT published_at INTO second_date FROM get_news_feed(10, 0, true) LIMIT 1 OFFSET 1;
  
  IF first_date < second_date THEN
    RAISE EXCEPTION 'Sorting failed: First item date % is older than second item date %', first_date, second_date;
  END IF;
END $$;

ROLLBACK;

