"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const councilMembers = [
  {
    name: "Vojtěch Kaska",
    role: "Předseda",
    bio: "Hlavní koordinátor činnosti AKH. Zodpovídá za vedení spolku a komunikaci s partnery.",
    image: "", // Placeholder
  },
  {
    name: "Jana Capurková",
    role: "Předsedkyně",
    bio: "Zastupuje předsedu a koordinuje práci v regionech.",
    image: "",
  },
  {
    name: "Marie Svobodová",
    role: "Hospodář",
    bio: "Stará se o finance, granty a členské příspěvky.",
    image: "",
  },
  {
    name: "Petr Dvořák",
    role: "Člen rady (PR)",
    bio: "Spravuje sociální sítě, web a komunikaci s veřejností.",
    image: "",
  },
  {
    name: "Anna Černá",
    role: "Člen rady (Akce)",
    bio: "Pomáhá s organizací celostátních setkání a Velehradu.",
    image: "",
  },
];

const chaplains = [
 {
    name: "P. Jiří Zámečník",
    role: "Duchovní doprovázení",
    bio: "Kněz, který nás duchovně doprovází, slouží mše a je k dispozici pro rozhovory.",
    image: "",
  },
];

export function TeamSection() {
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-24">
          {councilMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="relative mb-6">
                  <Avatar className="h-28 w-28 border-4 border-background group-hover:scale-105 transition-transform duration-300 ring-1 ring-border">
                    <AvatarImage src={member.image} alt={member.name} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary flex items-center justify-center">
                        {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground tracking-tight group-hover:text-primary transition-colors">{member.name}</h3>
              <p className="inline-block bg-muted px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">{member.role}</p>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                {member.bio}
              </p>
            </div>
          ))}
        </div>

        {/* Duchovní */}
        <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-[0.2em] uppercase mb-4 text-xs md:text-sm bg-primary/10 px-3 py-1.5 rounded-full inline-block">
                Duchovní služba
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 mt-4 text-foreground">Duchovní doprovázení</h2>
        </div>
        
        <div className="flex justify-center">
             {chaplains.map((member, index) => (
                <div key={index} className="flex flex-col items-center text-center max-w-md group">
                  <div className="relative mb-6">
                    <Avatar className="h-28 w-28 border-4 border-background group-hover:scale-105 transition-transform duration-300 ring-1 ring-border">
                        <AvatarImage src={member.image} alt={member.name} className="object-cover" />
                        <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary flex items-center justify-center">
                            {member.name.split(' ').filter((_, i) => i > 0).map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground tracking-tight group-hover:text-primary transition-colors">{member.name}</h3>
                   <p className="inline-block bg-muted px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    {member.bio}
                  </p>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
