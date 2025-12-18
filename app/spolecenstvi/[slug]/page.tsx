import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Mail } from "lucide-react";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  const supabase = await createClient();
  
  // Fetch city
  const { data: city } = await supabase.from('cities').select('*').eq('slug', unwrappedParams.slug).single();

  if (!city) {
    notFound();
  }

  // Fetch upcoming events for this city
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('city_id', city.id)
    .gte('start_time', new Date().toISOString()) // Only future events
    .order('start_time', { ascending: true });

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-secondary/30">
      <Navbar />

      {/* Hero */}
      {/* Hero */}
      <section className="w-full py-32 md:py-48 bg-background px-5 text-center border-b relative overflow-hidden">
         {city.image_url && (
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <img src={city.image_url} alt={city.name} className="w-full h-full object-cover" />
            </div>
         )}
         
         <div className="relative z-20 max-w-4xl mx-auto">
             <div className="flex justify-center mb-6">
                 <div className="bg-primary/10 p-4 rounded-full backdrop-blur-sm border border-primary/20">
                     <MapPin className="h-12 w-12 text-primary" />
                 </div>
             </div>
             <h1 className={`text-5xl md:text-7xl font-black tracking-tight mb-8 ${city.image_url ? 'text-white' : 'text-foreground'}`}>{city.name}</h1>
             {city.description && <p className={`text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto ${city.image_url ? 'text-zinc-200' : 'text-muted-foreground'}`}>{city.description}</p>}
         </div>
      </section>

      {/* Main Content */}
       {city.content && (
           <section className="w-full py-16 px-5 flex justify-center bg-background border-b">
               <div className="w-full max-w-3xl prose prose-lg dark:prose-invert leading-relaxed text-muted-foreground">
                   <div dangerouslySetInnerHTML={{ __html: city.content }} />
               </div>
           </section>
       )}

      <div className="w-full max-w-6xl mx-auto px-5 py-16">
          {/* Events Section */}
          {events && events.length > 0 && (
          <div className="w-full max-w-4xl mx-auto">
               <h3 className="text-xl font-bold border-b pb-2 mb-6 flex items-center gap-2">
                   Nadcházející akce v {city.name}
                   <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{events.length}</span>
               </h3>
               
               <div className="grid gap-4">
                   {events.map((event: any) => (
                       <div key={event.id} className="group bg-card p-6 rounded-xl border hover:border-primary/50 transition-all shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
                           <div className="flex flex-col items-center justify-center bg-muted/30 p-4 rounded-lg min-w-[80px] text-center border">
                                <span className="text-sm font-bold text-muted-foreground uppercase">{new Date(event.start_time).toLocaleString('cs-CZ', { month: 'short' })}</span>
                                <span className="text-2xl font-black text-foreground">{new Date(event.start_time).getDate()}</span>
                           </div>
                           <div className="flex-1">
                               <div className="flex flex-col gap-1 mb-2">
                                   <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{event.title}</h4>
                                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                       <Clock className="h-3 w-3" />
                                       {new Date(event.start_time).toLocaleString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                                        {event.location && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                                            </>
                                        )}
                                   </div>
                               </div>
                               <p className="text-muted-foreground line-clamp-2 text-sm">{event.description}</p>
                           </div>
                           <Button variant="ghost" size="sm" className="md:self-center">Detail</Button>
                       </div>
                   ))}
               </div>
          </div>
          )}
      </div>



      <Footer />
    </main>
  );
}
