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
    <div className="p-4 md:p-8 mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <Link href="/admin/blog/create">
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Nový článek
            </Button>
        </Link>
      </div>
      
      <div className="rounded-md border p-4 bg-card overflow-hidden">
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
                        <TableCell className="font-medium">
                            <div className="flex items-center justify-between gap-3 w-full">
                                <span className="truncate">{post.title}</span>
                            </div>
                        </TableCell>
                        <TableCell>{new Date(post.published_at).toLocaleDateString("cs-CZ")}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{post.slug}</TableCell>
                        <TableCell className="text-right">
                             <div className="flex items-center justify-end gap-2">
                                <Link href={`/admin/blog/${post.slug}`} className="sm:hidden">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                        <span className="sr-only">Upravit</span>
                                    </Button>
                                </Link>
                                <Link href={`/admin/blog/${post.slug}`} className="hidden sm:block">
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:bg-primary/10">
                                        Upravit
                                    </Button>
                                </Link>
                                <Link href={`/blog/${post.slug}`} target="_blank" className="hidden sm:inline-flex">
                                    <Button variant="ghost" size="sm">
                                        Zobrazit
                                    </Button>
                                </Link>
                             </div>
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
