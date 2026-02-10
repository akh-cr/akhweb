'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateContentBlock(id: string, content: any) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('content_blocks')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update content block: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/content');
  return { success: true };
}

export async function uploadContentImage(formData: FormData) {
    const supabase = await createClient();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
        throw new Error('No file provided');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, file);

    if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

    return { publicUrl };
}
