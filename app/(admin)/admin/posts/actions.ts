'use server'

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/guards';
import {
    guardedMutation,
    deleteWithImageCleanup,
    revalidate,
    type RevalidateSet,
} from '@/lib/admin/mutations';
import { slugify } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { assertNoTransientImageSource } from '@/lib/rich-text-images';

/** Surfaces a post change can affect (admin list + public blog + home feed). */
const POST_SURFACES: RevalidateSet = [
    '/admin/posts',
    '/blog',
    '/',
];

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
    
    // Use the RPC for unified feed fetching
    // This RPC handles joining tables, filtering, and sorting
    // It returns a superset of get_news_feed with all columns needed for admin
    const { data, error } = await supabase.rpc('get_admin_news_feed', { 
        p_limit: 100, // Fetch more for admin list
        p_offset: 0
    });

    if (error) {
        console.error('Error fetching admin news feed:', JSON.stringify(error, null, 2));
        return [];
    }

    // Map to Post interface
    return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: null,
        published_at: item.published_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        image_url: item.image_url,
        author_id: item.author_id ? item.author_id : '', // Handle potential nulls
        is_hidden: item.is_hidden,
        type: item.type as 'post' | 'event' | 'community'
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
    return guardedMutation(requireAdmin, async ({ supabase, user }) => {
        assertNoTransientImageSource(data.content);

        const { error } = await supabase
            .from('posts')
            .insert({
                ...data,
                slug: data.slug || slugify(data.title),
                author_id: user.id
            });

        if (error) {
            console.error('Error creating post:', error);
            throw new Error('Failed to create post');
        }

        revalidate(POST_SURFACES);
        // redirect('/admin/posts'); // Removed to avoid NEXT_REDIRECT error in client try/catch
    });
}

export async function updatePost(id: string, data: PostUpdate) {
    return guardedMutation(requireAdmin, async ({ supabase }) => {
        assertNoTransientImageSource(data.content);

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
                ...data
            })
            .eq('id', id);

        if (error) {
             console.error('Error updating post:', error);
             throw new Error('Failed to update post');
        }

        revalidate(['/admin/posts', `/admin/posts/${id}`, '/blog', '/']);
        // Check if public page needs revalidation based on slug?
        // revalidatePath(`/blog/${data.slug}`);
    });
}

export async function deletePost(id: string) {
    return guardedMutation(requireAdmin, async ({ supabase }) => {
        const { error } = await deleteWithImageCleanup(supabase, {
            table: 'posts',
            id,
            imageColumns: 'image_url',
        });

        if (error) {
            console.error('Error deleting post:', error);
            throw new Error('Failed to delete post');
        }

        revalidate(POST_SURFACES);
    });
}

export async function uploadBlogImage(formData: FormData) {
    const { uploadImageAction } = await import("@/lib/actions/upload-image");

    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
        throw new Error('No file provided');
    }

    const edgeFormData = new FormData();
    edgeFormData.append('file', file);
    edgeFormData.append('prefix', 'blog');
    if (path) edgeFormData.append('folder', path);

    return uploadImageAction(edgeFormData);
}

export async function togglePostVisibility(id: string, isHidden: boolean) {
    return guardedMutation(requireAdmin, async ({ supabase }) => {
        const { error } = await supabase
            .from('posts')
            .update({ is_hidden: isHidden })
            .eq('id', id)

        if (error) {
            throw new Error('Failed to update post visibility')
        }

        revalidate(['/admin/posts', '/blog', '/blog/[slug]', '/'])
    });
}
