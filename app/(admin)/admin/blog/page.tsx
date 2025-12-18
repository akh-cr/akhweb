import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Plus } from "lucide-react";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from('posts').select('*').order('published_at', { ascending: false });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <Link href="/admin/blog/create">
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Nový článek
            </Button>
        </Link>
      </div>
      
      <div className="rounded-md border p-4 bg-card">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Název</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {posts?.map((post:any) => (
                    <TableRow key={post.slug}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{new Date(post.published_at).toLocaleDateString("cs-CZ")}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{post.slug}</TableCell>
                        <TableCell className="text-right">
                             <Link href={`/admin/blog/${post.slug}`}>
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" /> Upravit
                                </Button>
                             </Link>
                             <Link href={`/blog/${post.slug}`} target="_blank" className="ml-2">
                                <Button variant="ghost" size="sm">
                                    Zobrazit
                                </Button>
                             </Link>
                        </TableCell>
                    </TableRow>
                ))}
                {(!posts || posts.length === 0) && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            Zatím žádné články.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  )
}
