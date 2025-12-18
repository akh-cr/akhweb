import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('*, cities(name)').eq('slug', unwrappedParams.slug).single();

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-secondary/30">
      <Navbar />

      <section className="w-full py-20 bg-background px-5 text-center border-b">
         <div className="flex justify-center mb-4">
             <div className="bg-primary/5 p-4 rounded-full">
                 <Calendar className="h-10 w-10 text-primary" />
             </div>
         </div>
         <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">{event.title}</h1>
         {event.description && <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{event.description}</p>}
      </section>

      {/* Content */}
       {event.content && (
           <section className="w-full py-16 px-5 flex justify-center bg-background border-b">
               <div className="w-full max-w-3xl prose prose-lg dark:prose-invert leading-relaxed">
                   <div dangerouslySetInnerHTML={{ __html: event.content }} />
               </div>
           </section>
       )}

      <section className="w-full py-16 px-5 flex justify-center">
          <div className="w-full max-w-2xl grid gap-6">
              <div className="bg-card p-6 rounded-xl border flex items-center gap-4">
                  <Clock className="h-6 w-6 text-muted-foreground shrink-0" />
                  <p className="text-lg font-semibold">
                    {new Date(event.start_time).toLocaleDateString("cs-CZ", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {event.end_time && ` - ${new Date(event.end_time).toLocaleDateString("cs-CZ", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                  </p>
              </div>

             {event.cities?.name && (
                  <div className="bg-card p-6 rounded-xl border flex items-center gap-4">
                      <MapPin className="h-6 w-6 text-muted-foreground shrink-0" />
                      <p className="text-lg font-semibold">{event.cities.name}</p>
                  </div>
              )}
              
              {event.registration_link && (
                    <div className="flex justify-center mt-4">
                        <a href={event.registration_link} target="_blank">
                             <Button size="lg" className="w-full md:w-auto px-8">Registrace na akci</Button>
                        </a>
                    </div>
              )}

              <div className="mt-8 flex justify-center">
                  <Link href="/akce">
                      <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/>Zpět na přehled akcí</Button>
                  </Link>
              </div>
          </div>
      </section>
      
      <Footer />
    </main>
  );
}
