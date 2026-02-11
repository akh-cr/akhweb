import { createClient } from "@/lib/supabase/server";
import { PostForm } from "../post-form";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  // Transform content for form if needed
  // PostForm expects initialData to match Post interface
  // Post interface has content: any
  // We store { html: "..." } in content jsonb.
  // PostForm accesses initialData?.content?.html

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Upravit aktualitu</h1>
        {post.slug && (
          <Link href={`/blog/${post.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Zobrazit na webu
            </Button>
          </Link>
        )}
      </div>
      <PostForm initialData={post} />
    </div>
  );
}
