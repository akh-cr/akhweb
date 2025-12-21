"use client"

import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Footer() {
  return (
      <footer className="w-full py-12 text-center text-sm text-muted-foreground border-t bg-background">
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left px-5">
            <div>
                <h4 className="font-bold mb-4 text-foreground">Kontakt</h4>
                <p>Absolventské křesťanské hnutí, z. s.</p>
                <p>Ječná 505/2, Nové Město</p>
                <p>120 00 Praha 2</p>
                <p className="mt-2">IČO: 21202125</p>
            </div>
            <div>
                <h4 className="font-bold mb-4 text-foreground">Bankovní spojení</h4>
                <p>Číslo účtu:</p>
                <p className="font-mono">2002808176/2010</p>
                <p className="mt-4"><a href="mailto:info@akhcr.cz" className="hover:text-primary hover:underline transition-colors">info@akhcr.cz</a></p>
            </div>
            <div>
                <h4 className="font-bold mb-4 text-foreground">Odkazy</h4>
                <ul className="space-y-2">
                    <li><Link href="/ke-stazeni" className="hover:text-primary hover:underline transition-colors">Dokumenty ke stažení</Link></li>
                    <li><Link href="/podpora" className="hover:text-primary hover:underline transition-colors">Podpořte nás</Link></li>
                    <li><Link href="/uzitecne-odkazy" className="hover:text-primary hover:underline transition-colors">Užitečné odkazy</Link></li>
                </ul>
            </div>
            <div>
               <h4 className="font-bold mb-4 text-foreground">Newsletter</h4>
               <p className="mb-4 leading-relaxed">Chceš vědět, co se děje? Přihlas se k odběru novinek.</p>
               <a 
                   href="https://forms.gle/nt5Kqv2jAHhmPUuu7" 
                   target="_blank"
                   className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
               >
                   Přihlásit se k odběru
               </a>

            </div>
         </div>
         <p>&copy; {new Date().getFullYear()} AKH ČR. Všechna práva vyhrazena.</p>

         <div className="mt-4 flex justify-center gap-4">
             <ThemeSwitcher />
         </div>
      </footer>
  );
}
