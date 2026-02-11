import { createClient } from "@/lib/supabase/server";
import { ContentEditor } from "./client";

export default async function ContentPage() {
  const supabase = await createClient();
  const { data: blocks } = await supabase
    .from('content_blocks')
    .select('*')
    .order('id');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Správa obsahu</h1>
      <ContentEditor initialBlocks={blocks || []} />
    </div>
  );
}
