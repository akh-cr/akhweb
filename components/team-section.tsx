import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";

export async function TeamSection() {
  const supabase = await createClient();
  const { data: councilMembers } = await supabase
    .from('council_members')
    .select('*')
    .eq('active', true)
    .order('priority', { ascending: true });



  return (
    <section className="w-full py-20 px-5 bg-background">
      <div className="max-w-6xl mx-auto">
        
        {/* Rada */}
        <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-[0.2em] uppercase mb-4 text-xs md:text-sm bg-primary/10 px-3 py-1.5 rounded-full inline-block">
                Náš tým
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 mt-4 text-foreground">Rada AKH</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                Lidé, kteří ve svém volném čase pracují na tom, aby Absolventské křesťanské hnutí fungovalo a rostlo.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-24">
          {(councilMembers || []).map((member) => (
            <div key={member.id} className="flex flex-col items-center text-center group">
              <div className="relative mb-6">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-sm group-hover:scale-105 transition-transform duration-300 ring-1 ring-border/50">
                    <AvatarImage src={member.image_url || ""} alt={member.name} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary flex items-center justify-center">
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
              </div>
              
              <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors mb-1">{member.name}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">{member.role}</p>
              
              {member.bio && (
                  <p className="text-muted-foreground text-base leading-relaxed italic max-w-xs relative px-4">
                    <span className="text-primary/20 absolute -top-2 left-0 text-2xl font-serif">&quot;</span>
                    {member.bio}
                    <span className="text-primary/20 absolute -bottom-4 right-0 text-2xl font-serif">&quot;</span>
                  </p>
              )}
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
