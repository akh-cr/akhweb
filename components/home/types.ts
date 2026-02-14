export interface FeedItem {
  id: string
  title: string
  slug?: string
  date: string
  type: 'event' | 'post'
  excerpt?: string
  location?: string
}

export interface HomeLayoutContent {
  'home.gallery'?: { images: string[] };
  'home.video'?: { videoId: string; title: string; description: string };
  'home.about'?: { 
    title?: string; 
    text?: string; 
    items?: string[];
    image?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  'home.hero'?: { images: string[] };
}

export interface HomeLayoutProps {
  feedItems: FeedItem[];
  // design is handled in the component definition
  content?: HomeLayoutContent;
}
