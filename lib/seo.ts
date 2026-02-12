import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export async function getPageSeo(slug: string): Promise<{ title?: string; description?: string } | null> {
  const supabase = await createClient();
  
  // Try to fetch page metadata
  // We select widely to cover potential failure modes if columns don't exist, 
  // but Supabase/PostgREST might error if we select non-existent columns.
  // Since we don't know the exact schema, we'll try standard fields.
  // Based on app/[slug]/page.tsx, we know 'title' and 'content' exist.
  // We'll assume 'description' might exist, or 'seo_description'.
  // Safest bet is to fetch * and map, but specific columns is better for perf.
  // Let's rely on 'title' and check for 'description' or 'excerpt' (common in this codebase).
  
  try {
    const { data: page, error } = await supabase
        .from('pages')
        .select('title, seo_title, description, seo_description, excerpt')
        .eq('slug', slug)
        .single();
        
    if (error || !page) return null;

    // Normalize
    // Prefer seo_title > title
    // Prefer seo_description > description > excerpt
    const title = page.seo_title || page.title;
    const description = page.seo_description || page.description || page.excerpt;

    return {
        title,
        description
    };
  } catch (e) {
      console.error(`Error fetching SEO for ${slug}:`, e);
      return null;
  }
}

export const defaultMetadata: Metadata = {
    title: {
        template: "%s | Absolventské křesťanské hnutí",
        default: "Absolventské křesťanské hnutí",
    },
    description: "Společenství mladých křesťanů. Nabízíme přechodový můstek mezi studentským životem a plným zapojením do profesního a farního života.",
    icons: {
        icon: "/logo.svg",
        shortcut: "/logo.svg",
        apple: "/logo.svg",
    },
};
