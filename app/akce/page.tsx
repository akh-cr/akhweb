import { Navbar } from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { MapPin, ArrowRight } from "lucide-react";
import { GoogleCalendar } from "@/components/google-calendar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { getContentBlocks, HeaderBlock } from "@/lib/content";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const contentMap = await getContentBlocks(['akce.header']);
  const header = (contentMap['akce.header'] || {
    title: "Akce",
    subtitle: "Přehled všech akcí, které pro tebe chystáme. Duchovní, zábavné i vzdělávací.",
    image: "/images/backgrounds/akce-new-3.jpg"
  }) as HeaderBlock['content'];
  
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const pageSize = 9;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch upcoming events (no pagination needed usually, as there are few)
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*, cities(name)')
    .gte('start_time', now)
    .order('start_time', { ascending: true });

  // Fetch past events with pagination
  const { data: pastEvents, count } = await supabase
    .from('events')
    .select('*, cities(name)', { count: 'exact' })
    .lt('start_time', now)
    .order('start_time', { ascending: false })
    .range(from, to);

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

      {/* Upcoming Events List */}
      <section className="w-full py-20 max-w-4xl mx-auto px-5">
         <h2 className="text-2xl font-bold mb-8">Nadcházející akce</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!upcomingEvents || upcomingEvents.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border col-span-full">
                    <p className="text-muted-foreground">Zatím žádné naplánované akce.</p>
                </div>
            ) : (
                upcomingEvents.map((event: any) => (
                    <Link 
                        key={event.id} 
                        href={`/akce/${event.slug || '#'}`}
                        className={`flex flex-col h-full bg-card rounded-xl border overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all group ${!event.slug ? "pointer-events-none opacity-80" : ""}`}
                    >
                        {/* Image Caption/Cover */}
                        {event.image_url ? (
                            <div className="relative h-48 w-full overflow-hidden">
                                 <Image 
                                    src={event.image_url} 
                                    alt={event.title} 
                                    fill 
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                 />
                            </div>
                        ) : (
                            <div className="h-48 w-full bg-muted/50 flex items-center justify-center border-b">
                                <MapPin className="h-10 w-10 text-muted-foreground/20" />
                            </div>
                        )}

                        <div className="p-5 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                    {new Date(event.start_time).toLocaleDateString('cs-CZ')}
                                </span>
                                
                                {/* Smart Location: If city exists, show it. If not, try to parse city from location or show full location */}
                                {(event.cities?.name || event.location) && (
                                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full truncate max-w-[150px]">
                                        {event.cities?.name || event.location.split(',')[0]}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {event.title}
                            </h3>

                            {/* Venue Line: Always show full location if available, with MapPin */}
                            {event.location && (
                                <div className="flex items-center text-xs text-muted-foreground mb-2">
                                    <MapPin className="h-3 w-3 mr-1 shrink-0" />
                                    <span className="truncate">{event.location}</span>
                                </div>
                            )}

                            <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                                {event.description}
                            </p>

                            <div className="flex items-center text-primary font-medium text-sm mt-auto group-hover:underline underline-offset-4 decoration-primary/30">
                                {event.gallery_images && event.gallery_images.length > 0 ? "Prohlédnout fotky" : "Zobrazit podrobnosti"} <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </Link>
                ))
            )}
         </div>
      </section>

      {/* Past Events List */}
      <section className="w-full py-16 bg-muted/30 border-t px-5" id="past-events">
         <div className="max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold mb-8 text-muted-foreground">Proběhlé akce</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {!pastEvents || pastEvents.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-12">Žádné proběhlé akce k zobrazení.</p>
                ) : (
                    pastEvents.map((event: any) => (
                        <Link 
                            key={event.id} 
                            href={`/akce/${event.slug || '#'}`}
                            className={`flex flex-col h-full bg-card rounded-xl border overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all group ${!event.slug ? "pointer-events-none opacity-80" : ""}`}
                        >
                            {/* Image Caption/Cover */}
                            {event.image_url ? (
                                <div className="relative h-48 w-full overflow-hidden">
                                     <Image 
                                        src={event.image_url} 
                                        alt={event.title} 
                                        fill 
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                     />
                                </div>
                            ) : (
                                <div className="h-48 w-full bg-muted/50 flex items-center justify-center border-b">
                                    <MapPin className="h-10 w-10 text-muted-foreground/20" />
                                </div>
                            )}

                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                    {new Date(event.start_time).toLocaleDateString('cs-CZ')}
                                </span>
                                {(event.cities?.name || event.location) && (
                                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full truncate max-w-[150px]">
                                        {event.cities?.name || event.location.split(',')[0]}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {event.title}
                            </h3>

                            {event.location && (
                                <div className="flex items-center text-xs text-muted-foreground mb-2">
                                    <MapPin className="h-3 w-3 mr-1 shrink-0" />
                                    <span className="truncate">{event.location}</span>
                                </div>
                            )}

                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                                    {event.description}
                                </p>

                                <div className="flex items-center text-primary font-medium text-sm mt-auto group-hover:underline underline-offset-4 decoration-primary/30">
                                    {event.gallery_images && event.gallery_images.length > 0 ? "Prohlédnout fotky" : "Zobrazit podrobnosti"} <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
             </div>

             {/* Pagination Controls */}
             {totalPages > 1 && (
                 <Pagination>
                     <PaginationContent>
                         {page > 1 && (
                             <PaginationItem>
                                 <PaginationPrevious href={`/akce?page=${page - 1}#past-events`} />
                             </PaginationItem>
                         )}
                         
                         {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                             // Simple logic to show limited pages if too many (basic implementation for now)
                             if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                 return (
                                     <PaginationItem key={p}>
                                         <PaginationLink href={`/akce?page=${p}#past-events`} isActive={page === p}>
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
                                 <PaginationNext href={`/akce?page=${page + 1}#past-events`} />
                             </PaginationItem>
                         )}
                     </PaginationContent>
                 </Pagination>
             )}
         </div>
      </section>

      {/* Google Calendar Section */}
      <section className="w-full py-16 bg-white dark:bg-zinc-900 border-t flex flex-col items-center px-5">
            <h2 className="text-3xl font-bold mb-8">Kalendář akcí</h2>
            <div className="w-full max-w-4xl aspect-[4/3] md:aspect-[16/9] bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-border">
                <GoogleCalendar />
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-5">
                 <a href="https://calendar.google.com/calendar/ical/c_64c2fa04923e833c63e15e926d92ae4cf4db6a29c36b482446308b5fd65ab728%40group.calendar.google.com/public/basic.ics" target="_blank" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        Odebírat iCal
                    </Button>
                 </a>
                 <a href="https://calendar.google.com/calendar/embed?src=c_64c2fa04923e833c63e15e926d92ae4cf4db6a29c36b482446308b5fd65ab728%40group.calendar.google.com&ctz=Europe%2FPrague" target="_blank" className="w-full sm:w-auto">
                    <Button variant="default" size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                        Otevřít v Google Kalendáři <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                 </a>
            </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
