'use server'

import { requireAdmin } from "@/lib/auth/guards";
import { guardedMutation, revalidate, type RevalidateSet } from "@/lib/admin/mutations";
import { validateContent, type ContentBlockType } from "@/lib/content";

/** Surfaces a content-block change can affect (home page + admin editor). */
const CONTENT_SURFACES: RevalidateSet = ['/', '/admin/content'];

export async function updateContentBlock(id: string, content: unknown) {
  return guardedMutation(requireAdmin, async ({ supabase }) => {
    // Validate BEFORE the DB write: look up the block's declared type
    // (authoritative server-side, never trusting a client-supplied type) and
    // run the typed validator. Malformed content throws here and never reaches
    // the database — no unvalidated `any` is persisted.
    const { data: block, error: lookupError } = await supabase
      .from('content_blocks')
      .select('type')
      .eq('id', id)
      .single();

    if (lookupError || !block) {
      throw new Error(`Content block not found: ${id}`);
    }

    const validated = validateContent(block.type as ContentBlockType, content);

    const { error } = await supabase
      .from('content_blocks')
      .update({ content: validated, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update content block: ${error.message}`);
    }

    revalidate(CONTENT_SURFACES);
    return { success: true };
  });
}

export async function uploadContentImage(formData: FormData) {
    const { uploadImageAction } = await import("@/lib/actions/upload-image");

    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
        throw new Error('No file provided');
    }

    const edgeFormData = new FormData();
    edgeFormData.append('file', file);
    edgeFormData.append('prefix', 'content');
    if (path) edgeFormData.append('folder', path);

    return uploadImageAction(edgeFormData);
}
