
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ContentBlockType = 'header' | 'rich_text' | 'text_image' | 'gallery' | 'video' | 'partners' | 'contact_details' | 'text' | 'council_members' | 'materials';

/**
 * Per-type content schemas — the SINGLE source of truth for a block's `content`
 * shape. The exported `XxxBlock` interfaces below derive their `content` from
 * these (`z.infer`), so the declared TS types and the runtime validators can
 * never drift. {@link validateContent} runs these on the write path so no
 * unvalidated `content` reaches the database.
 *
 * The shapes are behaviour-compatible with the interfaces this module declared
 * before: required fields stay required, optional fields stay optional. Strings
 * are NOT `.min(1)`-constrained because the admin editor legitimately saves
 * empty strings (e.g. a cleared subtitle) — the contract is "right shape", not
 * "non-empty".
 */
const headerContentSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  image: z.string().optional(),
});

const richTextContentSchema = z.object({
  content: z.string(),
});

const textImageContentSchema = z.object({
  title: z.string().optional(),
  text: z.string(),
  image: z.string().optional(),
  items: z.array(z.string()).optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
});

const galleryContentSchema = z.object({
  images: z.array(z.string()),
});

const videoContentSchema = z.object({
  videoId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
});

const partnersContentSchema = z.object({
  links: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      secondary: z
        .object({
          title: z.string(),
          url: z.string(),
        })
        .optional(),
    }),
  ),
});

const contactDetailsContentSchema = z.object({
  address: z.array(z.string()),
  email: z.string(),
  bankAccount: z.string(),
  variableSymbol: z.string().optional(),
  socials: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }),
  people: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
      image: z.string().optional(),
      councilMemberId: z.string().optional(),
    }),
  ),
});

const textSimpleContentSchema = z.object({
  text: z.string(),
  items: z.array(z.string()).optional(),
});

const councilMembersContentSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  councilMemberIds: z.array(z.string()),
});

const materialsContentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  items: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
    }),
  ),
});

/**
 * The registry mapping each block type to its content schema. This is what
 * {@link validateContent} dispatches on and is exported so callers/tests can
 * see every covered type in one place.
 */
export const contentBlockSchemas = {
  header: headerContentSchema,
  rich_text: richTextContentSchema,
  text_image: textImageContentSchema,
  gallery: galleryContentSchema,
  video: videoContentSchema,
  partners: partnersContentSchema,
  contact_details: contactDetailsContentSchema,
  text: textSimpleContentSchema,
  council_members: councilMembersContentSchema,
  materials: materialsContentSchema,
} as const satisfies Record<ContentBlockType, z.ZodTypeAny>;

/**
 * Validate a block's `content` against its declared type. Returns the parsed
 * content on success; THROWS on an unknown type or malformed content. This is
 * the validate-on-write entry point — `updateContentBlock` calls it BEFORE the
 * DB write so malformed `content` is rejected and never persisted.
 */
export function validateContent<T extends ContentBlockType>(
  type: T,
  content: unknown,
): z.infer<(typeof contentBlockSchemas)[T]> {
  const schema = contentBlockSchemas[type];
  if (!schema) {
    throw new Error(`Unknown content-block type: ${type}`);
  }
  return schema.parse(content) as z.infer<(typeof contentBlockSchemas)[T]>;
}

/**
 * Render-by-type entry point. Resolves a block's content for a declared type,
 * applying the per-type fallback that public pages used to inline as
 * `(contentMap[id] || { ...defaults }) as XxxBlock['content']`. When the stored
 * block is present it is returned unchanged (valid blocks render exactly as
 * before); when it is missing the typed `fallback` is returned.
 */
export function resolveContentBlock<T extends ContentBlockType>(
  _type: T,
  content: unknown,
  fallback: z.infer<(typeof contentBlockSchemas)[T]>,
): z.infer<(typeof contentBlockSchemas)[T]> {
  if (content === undefined || content === null) {
    return fallback;
  }
  return content as z.infer<(typeof contentBlockSchemas)[T]>;
}

export interface BaseContentBlock {
  id: string;
  type: ContentBlockType;
}

export interface HeaderBlock extends BaseContentBlock {
  type: 'header';
  content: z.infer<typeof headerContentSchema>;
}

export interface RichTextBlock extends BaseContentBlock {
  type: 'rich_text';
  content: z.infer<typeof richTextContentSchema>;
}

export interface TextImageBlock extends BaseContentBlock {
  type: 'text_image';
  content: z.infer<typeof textImageContentSchema>;
}

export interface GalleryBlock extends BaseContentBlock {
  type: 'gallery';
  content: z.infer<typeof galleryContentSchema>;
}

export interface VideoBlock extends BaseContentBlock {
  type: 'video';
  content: z.infer<typeof videoContentSchema>;
}

export interface PartnersBlock extends BaseContentBlock {
  type: 'partners';
  content: z.infer<typeof partnersContentSchema>;
}

export interface ContactDetailsBlock extends BaseContentBlock {
  type: 'contact_details';
  content: z.infer<typeof contactDetailsContentSchema>;
}

export interface TextSimpleBlock extends BaseContentBlock {
  type: 'text';
  content: z.infer<typeof textSimpleContentSchema>;
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
  content: z.infer<typeof materialsContentSchema>;
}

export interface CouncilMembersBlock extends BaseContentBlock {
  type: 'council_members';
  content: z.infer<typeof councilMembersContentSchema>;
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
