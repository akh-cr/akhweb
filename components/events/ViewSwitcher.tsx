"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layout, Columns, Image as ImageIcon, FileText } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function ViewSwitcher({ currentDesign }: { currentDesign: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleDesignChange = (design: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("design", design);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const ICON_SIZE = 16;

  const isHomePage = pathname === "/";

  return (
    <div className="fixed bottom-4 right-4 z-50 md:top-24 md:right-4 md:bottom-auto">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-background shadow-md gap-2 border-primary/20 hover:border-primary">
            <Layout size={ICON_SIZE} />
            <span className="hidden sm:inline">Vzhled: {currentDesign.toUpperCase()}</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup
                value={currentDesign}
                onValueChange={handleDesignChange}
            >
            {isHomePage ? (
                // Home Page Options (Hero Variants)
                <>
                    <DropdownMenuRadioItem className="flex gap-2 items-center cursor-pointer" value="clean">
                        <ImageIcon size={ICON_SIZE} className="text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-medium">Clean</span>
                            <span className="text-xs text-muted-foreground">Slideshow</span>
                        </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="flex gap-2 items-center cursor-pointer" value="default">
                        <Layout size={ICON_SIZE} className="text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-medium">Default</span>
                            <span className="text-xs text-muted-foreground">Standard Hero</span>
                        </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="flex gap-2 items-center cursor-pointer" value="split">
                        <Columns size={ICON_SIZE} className="text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-medium">Split</span>
                            <span className="text-xs text-muted-foreground">Dělený design</span>
                        </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="flex gap-2 items-center cursor-pointer" value="minimal">
                        <FileText size={ICON_SIZE} className="text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-medium">Minimal</span>
                            <span className="text-xs text-muted-foreground">Jednoduchý text</span>
                        </div>
                    </DropdownMenuRadioItem>
                </>
            ) : (
                // Subpage Options (Layout Variants)
                <>
                    <DropdownMenuRadioItem className="flex gap-2 items-center cursor-pointer" value="v1">
                        <FileText size={ICON_SIZE} className="text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-medium">Reader</span>
                            <span className="text-xs text-muted-foreground">Minimalistický</span>
                        </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="flex gap-2 items-center cursor-pointer" value="v2">
                        <Columns size={ICON_SIZE} className="text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-medium">Split</span>
                            <span className="text-xs text-muted-foreground">S postranním panelem</span>
                        </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="flex gap-2 items-center cursor-pointer" value="v3">
                        <ImageIcon size={ICON_SIZE} className="text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-medium">Hero</span>
                            <span className="text-xs text-muted-foreground">Vizuální</span>
                        </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="flex gap-2 items-center cursor-pointer" value="v4">
                        <ImageIcon size={ICON_SIZE} className="text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-medium">Minimal + Foto</span>
                            <span className="text-xs text-muted-foreground">S úvodní fotkou</span>
                        </div>
                    </DropdownMenuRadioItem>
                </>
            )}
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}
