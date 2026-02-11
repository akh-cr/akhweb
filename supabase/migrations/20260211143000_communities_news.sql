-- Add news_publish_date and is_hidden to communities table
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS news_publish_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

-- Add index on news_publish_date for faster sorting/filtering
CREATE INDEX IF NOT EXISTS idx_communities_news_publish_date ON public.communities(news_publish_date);
