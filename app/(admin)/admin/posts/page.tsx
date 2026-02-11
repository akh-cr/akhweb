import { getPosts } from "./actions";
import { columns } from "./columns";
import { DataTable } from "../events/data-table"; // Resuing existing DataTable component
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="p-1 sm:p-4 md:p-8 mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Správa Aktualit</h1>
        <Link href="/admin/posts/create">
            <Button>Přidat aktualitu</Button>
        </Link>
      </div>

      <div className="rounded-md bg-card overflow-hidden">
        <DataTable columns={columns} data={posts} />
      </div>
    </div>
  );
}
