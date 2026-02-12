'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { redirect } from 'next/navigation';

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: any; // jsonb
    published_at: string | null;
    image_url: string | null;
    author_id: string;
    created_at: string;
    updated_at: string;
    is_hidden: boolean;
    type?: 'post' | 'event' | 'community'; // Added type discriminator
}

export type PostCreate = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'author_id' | 'type'>;
export type PostUpdate = Partial<PostCreate>;

export async function getPosts(): Promise<Post[]> {
    const supabase = await createClient();
    
    // Fetch posts directly from DB to ensure admins see everything (drafts, future posts, etc.)
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: true });

    if (error) {
        console.error('Error fetching posts:', JSON.stringify(error, null, 2));
        return [];
    }

    // Map to Post interface
    return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: null, // Optimization
        published_at: item.published_at,
        image_url: item.image_url,
        author_id: item.author_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_hidden: item.is_hidden,
        type: 'post' // Always 'post' here
    }));
}

export async function getPost(id: string): Promise<Post | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching post:', error);
        return null;
    }

    return data;
}

export async function createPost(data: PostCreate) {
    const supabase = await createClient();
    const user = await supabase.auth.getUser();

    if (!user.data.user) {
        throw new Error('Not authenticated');
    }

    const { error } = await supabase
        .from('posts')
        .insert({
            ...data,
            slug: data.slug || slugify(data.title),
            author_id: user.data.user.id
        });

    if (error) {
        console.error('Error creating post:', error);
        throw new Error('Failed to create post');
    }

    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    revalidatePath('/');
    // redirect('/admin/posts'); // Removed to avoid NEXT_REDIRECT error in client try/catch
}

export async function updatePost(id: string, data: PostUpdate) {
    const supabase = await createClient();
    
    // Check if updating slug and if it exists
    if (data.slug) {
        const { data: existing } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', data.slug)
            .neq('id', id)
            .single();
            
        if (existing) {
             throw new Error('Slug already exists');
        }
    }

    const { error } = await supabase
        .from('posts')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
         console.error('Error updating post:', error);
         throw new Error('Failed to update post');
    }

    revalidatePath('/admin/posts');
    revalidatePath(`/admin/posts/${id}`);
    revalidatePath('/blog');
    revalidatePath('/');
    // Check if public page needs revalidation based on slug? 
    // revalidatePath(`/blog/${data.slug}`); 
}

export async function deletePost(id: string) {
    const supabase = await createClient();
    
    // 1. Fetch image to delete
    const { data: post } = await supabase
        .from('posts')
        .select('image_url')
        .eq('id', id)
        .single();
    
    // 2. Delete image
    if (post?.image_url) {
        const { deleteImage } = await import("@/lib/storage-server");
        await deleteImage(supabase, post.image_url);
    }

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting post:', error);
        throw new Error('Failed to delete post');
    }

    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    revalidatePath('/');
}

export async function uploadBlogImage(formData: FormData) {
    const supabase = await createClient();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string; // e.g. 'blog-images' or just 'images'

    if (!file) {
        throw new Error('No file provided');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error } = await supabase.storage
        .from('blog')
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading image:', error);
        throw new Error('Upload failed');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('blog')
        .getPublicUrl(filePath);

    return { publicUrl };
}

export async function togglePostVisibility(id: string, isHidden: boolean) {
    const supabase = await createClient();
    const user = await supabase.auth.getUser();

    if (!user.data.user) {
        throw new Error('Not authenticated');
    }
    
    const { error } = await supabase
        .from('posts')
        .update({ is_hidden: isHidden })
        .eq('id', id)

    if (error) {
        throw new Error('Failed to update post visibility')
    }

    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    revalidatePath('/blog/[slug]')
    revalidatePath('/')
}
