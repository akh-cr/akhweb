"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

import { FEATURES } from "@/lib/features";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const linkClass = (path: string) => `transition-colors whitespace-nowrap ${isActive(path) ? "text-primary font-bold" : "hover:text-primary"}`;
  const mobileLinkClass = (path: string) => `hover:text-primary ${isActive(path) ? "text-primary font-bold" : ""}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
      <nav className="w-full flex justify-center border-b h-16 bg-background sticky top-0 z-50">
        <div className="w-full max-w-6xl flex justify-between items-center px-5">
	            <Link href="/" className="font-bold text-2xl tracking-tighter text-foreground flex items-center gap-2 hover:opacity-80 transition">
	               <img src="/logo.svg" alt="AKH Logo" className="h-16 w-16 object-contain dark:hidden" />
                   <img src="/logo-white.svg" alt="AKH Logo" className="h-16 w-16 object-contain hidden dark:block" />
	            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6 text-sm font-medium uppercase tracking-wide text-foreground/80 overflow-x-auto">
                <Link href="/o-nas" className={linkClass("/o-nas")}>O nás</Link>
                <Link href="/akce" className={linkClass("/akce")}>Akce</Link>
                <Link href="/spolecenstvi" className={linkClass("/spolecenstvi")}>Společenství</Link>
                <a href="https://absolventskyvelehrad.cz" target="_blank" className="hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1">
                    Absolventský Velehrad <ExternalLink className="h-3 w-3" />
                </a>
                {FEATURES.BLOGS_ENABLED && <Link href="/blog" className={linkClass("/blog")}>Blog</Link>}
                <Link href="/podpora" className={linkClass("/podpora")}>Podpora</Link>
                <Link href="/kontakt" className={linkClass("/kontakt")}>Kontakt</Link>
            </div>
             
             {/* Mobile Menu */}
             <div className="md:hidden flex items-center gap-4">
                 {mounted && (
                     <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px] pt-12 px-6">
                            <SheetTitle className="sr-only">Menu</SheetTitle>
                            <div className="flex flex-col gap-6 mt-6 text-lg font-medium">
                                <Link href="/o-nas" className={mobileLinkClass("/o-nas")}>O nás</Link>
                                <Link href="/akce" className={mobileLinkClass("/akce")}>Akce</Link>
                                <Link href="/spolecenstvi" className={mobileLinkClass("/spolecenstvi")}>Společenství</Link>
                                <a href="https://absolventskyvelehrad.cz" target="_blank" className="hover:text-primary flex items-center gap-2">
                                    Absolventský Velehrad <ExternalLink className="h-4 w-4" />
                                </a>
                                {FEATURES.BLOGS_ENABLED && <Link href="/blog" className={mobileLinkClass("/blog")}>Blog</Link>}
                                <Link href="/podpora" className={mobileLinkClass("/podpora")}>Podpora</Link>
                                <Link href="/kontakt" className={mobileLinkClass("/kontakt")}>Kontakt</Link>
                                <div className="h-px bg-border my-2"></div>
                                 <Link href="/admin">
                                    <Button variant="outline" className="w-full">Vstup pro redaktory</Button>
                                 </Link>
                            </div>
                        </SheetContent>
                     </Sheet>
                 )}
             </div>

             <div className="hidden md:flex gap-4">
                 <Link href="/admin">
                    <Button variant="outline" className="rounded-full px-6 text-xs uppercase font-bold tracking-widest">Přihlášení</Button>
                 </Link>
             </div>
        </div>
      </nav>
  );
}
