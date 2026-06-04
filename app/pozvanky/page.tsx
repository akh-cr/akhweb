import { Navbar } from "@/components/navbar";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { getContentBlocks, resolveContentBlock } from "@/lib/content";
import { getPublicEvents } from "@/lib/events/read";
import { EventCard } from "@/components/events/EventCard";

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const contentMap = await getContentBlocks(['pozvanky.header']);
  const header = resolveContentBlock('header', contentMap['pozvanky.header'], {
    title: "Pozvánky od jiných",
    subtitle: "Akce dalších organizací a společenství, na které tě rádi pozveme.",
    image: "/images/backgrounds/akce-new-3.jpg"
  });

  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const pageSize = 9;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Upcoming + past external invitations (organizer_id IS NOT NULL); AKH events live on /akce.
  // All event reads flow through the events read module so the organizer/city joins never drift.
  const { data: upcomingEvents } = await getPublicEvents(supabase, {
    audience: 'external',
    scope: 'upcoming',
    now,
  });
  const { data: pastEvents, count } = await getPublicEvents(supabase, {
    audience: 'external',
    scope: 'past',
    now,
    range: { from, to },
  });

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-muted/30">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden text-center px-5 border-b">
         <div className="absolute inset-0 z-0">
             <Image
                 src={header.image || "/images/backgrounds/akce-new-3.jpg"}
                 alt={header.title}
                 fill
                 priority
                 className="object-cover brightness-[0.3]"
                 sizes="100vw"
                 quality={80}
             />
         </div>
         <div className="relative z-10 w-full max-w-4xl mx-auto">
             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white">{header.title}</h1>
             <p className="text-zinc-200 text-xl md:text-2xl mx-auto">
                 {header.subtitle}
             </p>
         </div>
      </section>

      {/* Upcoming invitations */}
      <section className="w-full py-20 max-w-4xl mx-auto px-5">
         <h2 className="text-2xl font-bold mb-8">Nadcházející pozvánky</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!upcomingEvents || upcomingEvents.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border col-span-full">
                    <p className="text-muted-foreground">Zatím žádné pozvánky od jiných.</p>
                </div>
            ) : (
                upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
            )}
         </div>
      </section>

      {/* Past invitations */}
      <section className="w-full py-16 bg-muted/30 border-t px-5" id="past-events">
         <div className="max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold mb-8 text-muted-foreground">Proběhlé pozvánky</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {!pastEvents || pastEvents.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-12">Žádné proběhlé pozvánky k zobrazení.</p>
                ) : (
                    pastEvents.map((event) => <EventCard key={event.id} event={event} />)
                )}
             </div>

             {/* Pagination Controls */}
             {totalPages > 1 && (
                 <Pagination>
                     <PaginationContent>
                         {page > 1 && (
                             <PaginationItem>
                                 <PaginationPrevious href={`/pozvanky?page=${page - 1}#past-events`} />
                             </PaginationItem>
                         )}

                         {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                             if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                 return (
                                     <PaginationItem key={p}>
                                         <PaginationLink href={`/pozvanky?page=${p}#past-events`} isActive={page === p}>
                                             {p}
                                         </PaginationLink>
                                     </PaginationItem>
                                 );
                             } else if (p === page - 2 || p === page + 2) {
                                 return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>
                             }
                             return null;
                         })}

                         {page < totalPages && (
                             <PaginationItem>
                                 <PaginationNext href={`/pozvanky?page=${page + 1}#past-events`} />
                             </PaginationItem>
                         )}
                     </PaginationContent>
                 </Pagination>
             )}
         </div>
      </section>

      <Footer />
    </main>
  );
}
