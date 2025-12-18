import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { MapPin, ArrowRight } from "lucide-react";

export default async function EventsPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Fetch upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*, cities(name)')
    .gte('start_time', now)
    .order('start_time', { ascending: true });

  // Fetch past events
  const { data: pastEvents } = await supabase
    .from('events')
    .select('*, cities(name)')
    .lt('start_time', now)
    .order('start_time', { ascending: false })
    .limit(5); // Limit to last 5 past events

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-muted/30">
      <Navbar />

      {/* Hero */}
      {/* Hero */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden text-center px-5 border-b">
         <div className="absolute inset-0 z-0">
             <img src="/images/backgrounds/akce-new-3.jpg" alt="Events Background" className="w-full h-full object-cover brightness-[0.3]" />
         </div>
         <div className="relative z-10 w-full max-w-4xl mx-auto">
             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white">Akce</h1>
             <p className="text-zinc-200 text-xl md:text-2xl mx-auto">
                 Přehled všech akcí, které pro tebe chystáme. Duchovní, zábavné i vzdělávací.
             </p>
         </div>
      </section>

      {/* Upcoming Events List */}
      <section className="w-full py-20 max-w-4xl mx-auto px-5">
         <h2 className="text-2xl font-bold mb-8">Nadcházející akce</h2>
         <div className="flex flex-col gap-4">
            {!upcomingEvents || upcomingEvents.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border">
                    <p className="text-muted-foreground">Zatím žádné naplánované akce.</p>
                </div>
            ) : (
                upcomingEvents.map((event: any) => (
                    <Link 
                        key={event.id} 
                        href={`/akce/${event.slug || '#'}`}
                        className={`block bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-md hover:border-primary/50 group ${!event.slug ? "pointer-events-none opacity-80" : ""}`}
                    >
                        <div className="flex flex-row gap-6 items-start">
                             {/* Date Badge */}
                             <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg min-w-[80px] h-fit border group-hover:bg-primary/5 transition shrink-0">
                                <span className="text-2xl font-bold text-primary">
                                    {new Date(event.start_time).getDate()}
                                </span>
                                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {new Date(event.start_time).toLocaleDateString('cs-CZ', { month: 'short' })}
                                 </span>
                             </div>
                             
                             {/* Details */}
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                     <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded">
                                        {event.cities?.name || "Celostátní"}
                                     </span>
                                     <span className="flex items-center text-xs text-muted-foreground font-medium truncate">
                                        <MapPin className="h-3 w-3 mr-1" /> {event.location || "Místo neupřesněno"}
                                     </span>
                                </div>
                                <h3 className="text-xl font-bold truncate pr-4 group-hover:text-primary transition-colors">{event.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                                    {event.description}
                                </p>
                             </div>

                             {/* Action Icon (Mobile/Desktop) */}
                             <div className="self-center hidden sm:block text-muted-foreground group-hover:text-primary transition-colors">
                                <ArrowRight className="h-5 w-5" />
                             </div>
                        </div>
                    </Link>
                ))
            )}
         </div>
      </section>

      {/* Past Events List */}
      <section className="w-full py-16 bg-muted/30 border-t px-5">
         <div className="max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold mb-8 text-muted-foreground">Proběhlé akce</h2>
             <div className="flex flex-col gap-4">
                {!pastEvents || pastEvents.length === 0 ? (
                    <p className="text-muted-foreground">Žádné proběhlé akce k zobrazení.</p>
                ) : (
                    pastEvents.map((event: any) => (
                        <Link 
                            key={event.id} 
                            href={`/akce/${event.slug || '#'}`}
                            className={`block bg-card/50 p-6 rounded-xl border transition-all duration-200 hover:shadow-md hover:border-primary/50 group hover:opacity-100 opacity-70 hover:bg-card ${!event.slug ? "pointer-events-none" : ""}`}
                        >
                            <div className="flex flex-row gap-6 items-start">
                                 {/* Date Badge */}
                                 <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg min-w-[80px] h-fit border shrink-0">
                                    <span className="text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                        {new Date(event.start_time).getDate()}
                                    </span>
                                     <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        {new Date(event.start_time).toLocaleDateString('cs-CZ', { month: 'short' })}
                                     </span>
                                 </div>
                                 
                                 {/* Details */}
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                         <span className="text-xs font-bold text-white bg-zinc-500 px-2 py-0.5 rounded">
                                            {event.cities?.name || "Celostátní"}
                                         </span>
                                         <span className="flex items-center text-xs text-muted-foreground font-medium truncate">
                                            <MapPin className="h-3 w-3 mr-1" /> {event.location || "Místo neupřesněno"}
                                         </span>
                                    </div>
                                    <h3 className="text-xl font-bold truncate pr-4 text-muted-foreground group-hover:text-foreground transition-colors">{event.title}</h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                                        {event.description}
                                    </p>
                                 </div>

                                 {/* Action Icon (Mobile/Desktop) */}
                                 <div className="self-center hidden sm:block text-muted-foreground group-hover:text-primary transition-colors">
                                    <ArrowRight className="h-5 w-5" />
                                 </div>
                            </div>
                        </Link>
                    ))
                )}
             </div>
         </div>
      </section>

      {/* Google Calendar Section */}
      <section className="w-full py-16 bg-white dark:bg-zinc-900 border-t flex flex-col items-center px-5">
            <h2 className="text-3xl font-bold mb-8">Kalendář akcí</h2>
            <div className="w-full max-w-4xl aspect-[4/3] md:aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden shadow-sm border">
                <iframe 
                    src="https://calendar.google.com/calendar/embed?src=c_64c2fa04923e833c63e15e926d92ae4cf4db6a29c36b482446308b5fd65ab728%40group.calendar.google.com&ctz=Europe%2FPrague" 
                    style={{border: 0}} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no">
                </iframe>
            </div>
            <div className="mt-8 flex gap-4">
                 <a href="https://calendar.google.com/calendar/ical/c_64c2fa04923e833c63e15e926d92ae4cf4db6a29c36b482446308b5fd65ab728%40group.calendar.google.com/public/basic.ics" target="_blank">
                    <Button variant="outline">
                        Odebírat iCal
                    </Button>
                 </a>
                 <a href="https://calendar.google.com/calendar/embed?src=c_64c2fa04923e833c63e15e926d92ae4cf4db6a29c36b482446308b5fd65ab728%40group.calendar.google.com&ctz=Europe%2FPrague" target="_blank">
                    <Button variant="default">
                        Otevřít v Google Kalendáři
                    </Button>
                 </a>
            </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
