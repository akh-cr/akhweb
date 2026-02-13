
import { createClient } from "@/lib/supabase/server";

export type ContentBlockType = 'header' | 'rich_text' | 'text_image' | 'gallery' | 'video' | 'partners' | 'contact_details' | 'text' | 'council_members' | 'materials';

export interface BaseContentBlock {
  id: string;
  type: ContentBlockType;
}

export interface HeaderBlock extends BaseContentBlock {
  type: 'header';
  content: {
    title: string;
    subtitle?: string;
    image?: string;
  };
}

export interface RichTextBlock extends BaseContentBlock {
  type: 'rich_text';
  content: {
    content: string; // HTML
  };
}

export interface TextImageBlock extends BaseContentBlock {
  type: 'text_image';
  content: {
    title?: string;
    text: string;
    image?: string;
    items?: string[];
    ctaText?: string;
    ctaLink?: string;
  };
}

export interface GalleryBlock extends BaseContentBlock {
  type: 'gallery';
  content: {
    images: string[];
  };
}

export interface VideoBlock extends BaseContentBlock {
  type: 'video';
  content: {
    videoId: string;
    title?: string;
    description?: string;
  };
}

export interface PartnersBlock extends BaseContentBlock {
  type: 'partners';
  content: {
    links: Array<{
        title: string;
        url: string;
        description?: string;
        secondary?: {
          title: string;
          url: string;
        };
    }>;
  };
}

export interface ContactDetailsBlock extends BaseContentBlock {
  type: 'contact_details';
  content: {
    address: string[]; 
    email: string;
    bankAccount: string;
    variableSymbol?: string;
    socials: {
        facebook?: string;
        instagram?: string;
    };
    people: Array<{
        name: string;
        role: string;
        phone?: string;
        email?: string;
        image?: string;
        councilMemberId?: string;
    }>;
  };
}

export interface TextSimpleBlock extends BaseContentBlock {
  type: 'text';
  content: {
    text: string;
    items?: string[];
  };
}

export type ContentBlock = 
  | HeaderBlock 
  | RichTextBlock 
  | TextImageBlock 
  | GalleryBlock 
  | VideoBlock
  | PartnersBlock
  | ContactDetailsBlock
  | TextSimpleBlock
  | CouncilMembersBlock
  | MaterialsBlock;

export interface MaterialsBlock extends BaseContentBlock {
  type: 'materials';
  content: {
    title: string;
    description?: string;
    items: Array<{
      title: string;
      url: string;
      description?: string;
      icon?: string;
    }>;
  };
}

export interface CouncilMembersBlock extends BaseContentBlock {
  type: 'council_members';
  content: {
    title: string;
    subtitle?: string;
    councilMemberIds: string[];
  };
}

export async function getContentBlocks(ids: string[]) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
        .from('content_blocks')
        .select('*')
        .in('id', ids);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blockMap = (data || []).reduce((acc: Record<string, any>, block: any) => {
        acc[block.id] = block.content;
        return acc;
    }, {});

    return blockMap;
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    return {};
  }
}
