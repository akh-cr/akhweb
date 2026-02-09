export interface FeedItem {
  id: string
  title: string
  slug?: string
  date: string
  type: 'event' | 'post'
  excerpt?: string
  location?: string
}

export interface HomeLayoutProps {
  feedItems: FeedItem[];
}
